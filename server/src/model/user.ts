import { Schema, Types, model } from "mongoose";
import colours from "./colours";
import { ContentGroup, IContent, mongoContent, mongoContentGroup, SourceType } from "./content";
import PlutchikError from "./error";
import {MLStringSchema} from "./mlstring";
import Organization, { DEFAULT_SESSION_DURATION, IOrganization, ISessionToken, mongoOrgs, mongoSessionTokens } from "./organization";
import { IVector, mongoAssessments } from "./assessment";
import TelegramBot from "node-telegram-bot-api";
import MongoProto from "./mongoproto";
import { randomInt } from "crypto";
import { Md5 } from "ts-md5";

export type RoleType = "supervisor"|"administrator"|"manage_users"|"manage_content"|"getting_match"|"offer_group";

export interface IAssign {
    _id: Types.ObjectId;
    userid: Types.ObjectId;
    tguserid?: number;
    groupid: Types.ObjectId;
    assigndate: Date;
    acceptdecline?: boolean;
    closed: boolean;
}

export interface IUser {
    _id?: Types.ObjectId;
    tguserid: number;
    birthdate?: Date;
    birthdateapproximately?: boolean;
    nativelanguage?: string;
    secondlanguages?: Array<string>,
    location?: string;
    gender?: string;
    maritalstatus?: string;
    features?: string;
    assignedgroups?: Array<IAssign>;
    blocked: boolean;
    auth_code_hash?: string;
    created: Date;
    changed?: Date;
    awaitcommanddata?: string;
    history?: Array<any>;
}

interface IObserveAssessments {
    ownVector: IVector;
    othersVector: IVector;
}

export const UserSchema = new Schema({
    tguserid: {type: Number, require: true},
    birthdate: {type: Date, require: false},
    birthdateapproximately: {type: Boolean, require: false},
    nativelanguage: {type: String, require: false},
    secondlanguages: {type: Array<string>, require: false},
    location: {type: String, require: false},
    gender: {type: String, require: false},
    maritalstatus: {type: String, require: false},
    features: {type: String, require: false},
    assignedgroups: {type: Array, require: false},
    awaitcommanddata: {type: String, require: false},
    auth_code_hash: {type: String, require: false},
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoUsers = model<IUser>('users', UserSchema);

export default class User extends MongoProto<IUser> {
    constructor(id?: Types.ObjectId, data?: IUser){
        super(mongoUsers, id, data);
    }
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }

    /**
     * Function check existing session token and increase its expired time
     * @param st session token
     * @param sessionminutes duration of session token
     * @returns list of roles on this session token
     */
    public async checkSessionToken(st?: Types.ObjectId, sessionminutes: number = DEFAULT_SESSION_DURATION): Promise<Types.ObjectId>{
        MongoProto.connectMongo();
        const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
        if (st) {
            const sts = await mongoSessionTokens.aggregate([{
                '$match': {
                    'useridref': this.id,
                    '_id': st,
                    'expired': {'$gte': new Date()}
                }
            }]);
            if (!sts.length) throw new PlutchikError("user:hasnoactivesession", `userid = '${this.id}'; sessiontoken = '${st}'`);
            if (sts[0].expired < nexpired) await mongoSessionTokens.findByIdAndUpdate(sts[0]._id, {expired:nexpired});
            console.log(`Session token updated: id = '${sts[0]._id}'; new expired = '${nexpired}'`);
            return st;
        } else {
            const ist: ISessionToken =  {
                _id: new Types.ObjectId,
                useridref: this.uid,
                expired: nexpired,
                created: new Date()
            };
            const st = await mongoSessionTokens.insertMany(ist);
            console.log(`New session token created: id = '${st[0]._id}'`);
            return st[0]._id;
        }
    }

    public async changeNativeLanguage(lang:string) {
        await this.checkData();
        if (this.data) this.data.nativelanguage = lang;
        await this.save();
    }

    public async setAge(age: number) {
        await this.checkData();
        if (this.data) {
            let d = new Date();
            d.setFullYear(d.getFullYear() - age);
            this.data.birthdate = d;
            this.data.birthdateapproximately = true;
        }
        await this.save();
    }

    public async setGender(gender?: string) {
        await this.checkData();
        if (this.data) {
            this.data.gender = gender;
        }
        await this.save();
    }

    public async setAwaitCommandData(cmd?: string) {
        await this.checkData();
        if (this.data) {
            this.data.awaitcommanddata = cmd;
            if (!cmd) delete this.data.awaitcommanddata;
        }
        await this.save();
    }
    public async deleteTgUser(){
        await this.checkData();
        if (this.data) {
            this.data.tguserid = -1;
        }
        await this.save();
    }

    public async nextContentItemByAssign (groupid: Types.ObjectId, assignid: Types.ObjectId, bot?: TelegramBot): Promise<IContent> {
        MongoProto.connectMongo();
        const v = await mongoContentGroup.aggregate([
            {
                '$match': {
                    '_id': groupid
                }
            }, {
                '$lookup': {
                    'from': 'contents', 
                    'localField': 'items', 
                    'foreignField': '_id', 
                    'as': 'result'
                }
            }, {
                '$unwind': '$result'
            }, {
                '$replaceRoot': {
                    'newRoot': '$result'
                  }
            }, {
                '$lookup': {
                    'from': 'assessments', 
                    'foreignField': 'cid', 
                    'localField': '_id', 
                    'pipeline': [{
                        '$match': {
                            '$expr': {'$eq': [
                                '$assignid', assignid
                            ]}
                        }
                    }], 
                    'as': 'result'
                  }
            }, {
                  '$match': {
                    'result': []
                  }
            }, {
                  '$addFields': {
                    'rand': {
                      '$rand': {}
                    }
                  }
            }, {
                '$sort': {
                    'rand': 1
                }
            },{
                '$limit': 1
            }, {
                '$project': {
                    'result':0,
                    'rand': 0
                }
            }
        ]);
        if (!v.length) {
            //let's close assignment of content grooup
            this.data?.assignedgroups?.forEach(el=>{if (el._id.equals(assignid)) el.closed = true});
            await this.save();
            //let's notify all about finish of the assessment
            const c = this.data?.assignedgroups?.filter(el=>el._id.equals(assignid));

            if (c) bot?.sendMessage(c[0].tguserid as number, `User ${this.uid} finished ${c[0]._id} assignment`);
            throw new PlutchikError("user:nonextcontent", `userid = '${this.id}';assignid='${assignid}';groupid='${groupid}'`);
        }
        //let's mark content item as asessed by assignment froup
        v[0].assignid = assignid;
        return v[0];
    }
    public async nextContentItem(bot?: TelegramBot, language?: string, source_type?: SourceType): Promise <IContent>{
        this.checkData();
        const assigns = this.data?.assignedgroups?.filter((val)=>!val.closed);
        if (assigns?.length) {
            return this.nextContentItemByAssign(assigns[0].groupid, assigns[0]._id, bot);
        } else {
            return this.nextContentItemAll(language, source_type);
        }
    }

    public async nextContentItemAll(language?: string, source_type?: SourceType): Promise <IContent>{
        //this.checkData();
        MongoProto.connectMongo();
        const v = await mongoContent.aggregate([
            {
                $match: {
                    'blocked': false
                }
            },{
                $addFields: {'newName': '$name'}
            },
            {
                $unwind: '$newName.values'
            }, 
            {
                $addFields: {
                    'otherLang': {
                        '$first': '$newName.values'
                    }
                }
            }, {
                $match: {
                    'otherLang': {                                
                        $regex: language?language:this.json?.nativelanguage, 
                        $options: 'i'
                    }
                }
            },
            {
                $project: {
                        "newName":0,
                        "otherLang":0
                }
            },
            {
                $unionWith: {
                    'coll': 'contents', 
                    'pipeline': [
                      {
                        $match: {
                            'language': {
                                '$regex': language?language:this.json?.nativelanguage, 
                                '$options': 'i'
                            },
                            'blocked': false
                        }
                    }
                    ]
                  }
            },
        {$lookup: {
            from: "assessments",
            let: {
              contentid: "$_id",
            },
            pipeline: [{
              $match: {
                $expr: {
                  $and: [
                    {$eq: [this.id, "$uid",]},
                    {$eq: ["$cid", "$$contentid"]},
                  ],
                },
              },
            }],
            as: "result",
          },
        }, {
          $match: {
            result: [],
          },
        }, {
            $addFields: {
                'rand': {
                    $rand: {}
                }
            }
        }, {
            $sort: {
                'rand': 1
            }
        },{
          $limit: 1,
        }]);
        if (!v.length) throw new PlutchikError("user:nonextcontent", `userid = '${this.id}';`)
        return v[0];
    }

    public async observeAssessments():Promise<IObserveAssessments> {
        const ret: IObserveAssessments = {
            ownVector: {},
            othersVector:{}
        };
        await this.checkData();
        if (this.id) {
            const own = await mongoAssessments.aggregate([
                {
                    '$match': {
                    'uid': this.id}
                }, {
                    '$lookup': {
                        'from': 'assessments', 
                        'let': {
                            'cid': '$cid', 
                            'uid': '$uid'
                        }, 
                        'pipeline': [{
                            '$match': {
                                '$expr': {
                                    '$and': [
                                    {
                                        '$eq': [
                                            '$cid', '$$cid'
                                        ]
                                    }, {
                                        '$ne': [
                                            '$uid', '$$uid'
                                        ]
                                    }
                                    ]
                                }
                            }
                        }], 
                        'as': 'result'
                    }
                }, {
                    '$project': {
                        '_id': 1, 
                        'vector': 1, 
                        'result_size': {
                            '$size': '$result'
                        }
                    }
                }, {
                    '$match': {
                        'result_size': {
                            '$gt': 0
                        }
                    }
                }, {
                    '$group': {
                        '_id': '1', 
                        'joy': {
                            '$avg': {
                                '$toDouble': '$vector.joy'
                            }
                        }, 
                        'trust': {
                            '$avg': {
                                '$toDouble': '$vector.trust'
                            }
                        }, 
                        'fear': {
                            '$avg': {
                                '$toDouble': '$vector.fear'
                            }
                        }, 
                        'surprise': {
                            '$avg': {
                                '$toDouble': '$vector.surprise'
                            }
                        }, 
                        'sadness': {
                            '$avg': {
                                '$toDouble': '$vector.sadness'
                            }
                        }, 
                        'disgust': {
                            '$avg': {
                                '$toDouble': '$vector.disgust'
                            }
                        }, 
                        'anger': {
                            '$avg': {
                                '$toDouble': '$vector.anger'
                            }
                        }, 
                        'anticipation': {
                            '$avg': {
                                '$toDouble': '$vector.anticipation'
                            }
                        }, 
                        'count': {
                            '$sum': 1
                        }
                    }
                },{
                    '$project':{
                        '_id':0
                    }
                }
            ]);
            ret.ownVector = own[0];

            const others = await mongoAssessments.aggregate([
                {
                    '$match': {
                    'uid': this.id
                    }
                }, {
                    '$lookup': {
                    'from': 'assessments', 
                    'let': {
                        'cid': '$cid', 
                        'uid': '$uid'
                    }, 
                    'pipeline': [
                        {
                        '$match': {
                            '$expr': {
                            '$and': [
                                {
                                '$eq': [
                                    '$cid', '$$cid'
                                ]
                                }, {
                                '$ne': [
                                    '$uid', '$$uid'
                                ]
                                }
                            ]
                            }
                        }
                        }
                    ], 
                    'as': 'result'
                    }
                }, {
                    '$project': {
                    'vector': 1, 
                    'result': 1, 
                    'result_size': {
                        '$size': '$result'
                    }
                    }
                }, {
                    '$match': {
                    'result_size': {
                        '$gt': 0
                    }
                    }
                }, {
                    '$unwind': {
                    'path': '$result'
                    }
                }, {
                    '$replaceRoot': {
                    'newRoot': '$result'
                    }
                }, {
                    '$group': {
                    '_id': '$cid', 
                    'joy': {
                        '$avg': {
                        '$toDouble': '$vector.joy'
                        }
                    }, 
                    'trust': {
                        '$avg': {
                        '$toDouble': '$vector.trust'
                        }
                    }, 
                    'fear': {
                        '$avg': {
                        '$toDouble': '$vector.fear'
                        }
                    }, 
                    'surprise': {
                        '$avg': {
                        '$toDouble': '$vector.surprise'
                        }
                    }, 
                    'sadness': {
                        '$avg': {
                        '$toDouble': '$vector.sadness'
                        }
                    }, 
                    'disgust': {
                        '$avg': {
                        '$toDouble': '$vector.disgust'
                        }
                    }, 
                    'anger': {
                        '$avg': {
                        '$toDouble': '$vector.anger'
                        }
                    }, 
                    'anticipation': {
                        '$avg': {
                        '$toDouble': '$vector.anticipation'
                        }
                    }, 
                    'count': {
                        '$sum': 1
                    }
                    }
                }, {
                    '$group': {
                        _id: "1",
                        joy: {
                          $avg: {
                            $toDouble: "$joy",
                          },
                        },
                        trust: {
                          $avg: {
                            $toDouble: "$trust",
                          },
                        },
                        fear: {
                          $avg: {
                            $toDouble: "$fear",
                          },
                        },
                        surprise: {
                          $avg: {
                            $toDouble: "$surprise",
                          },
                        },
                        sadness: {
                          $avg: {
                            $toDouble: "$sadness",
                          },
                        },
                        disgust: {
                          $avg: {
                            $toDouble: "$disgust",
                          },
                        },
                        anger: {
                          $avg: {
                            $toDouble: "$anger",
                          },
                        },
                        anticipation: {
                          $avg: {
                            $toDouble: "$anticipation",
                          },
                        },
                        count: {
                          $sum: "$count",
                        },
                      } 
                }, {
                    '$project': {
                    '_id': 0
                    }
                }
            ]);
            ret.othersVector = others[0];
        }
        return ret;
    }

    public async assignContentGroup(from: User, group: ContentGroup) {
        this.checkData();
        const a: IAssign = {
            _id: new Types.ObjectId(),
            userid: from.uid as Types.ObjectId,
            tguserid: from.json?.tguserid,
            groupid: group.uid as Types.ObjectId,
            assigndate: new Date(),
            closed: false
        }
        if (this.data && !this.data?.assignedgroups)this.data.assignedgroups = [];
        // let's check the same not closed group exists
        const exists = this.data?.assignedgroups?.filter((val)=>val.groupid.equals(group.uid as Types.ObjectId));
        if (!exists?.length) this.data?.assignedgroups?.push(a);
        await this.save();
    }
    public async createAuthCode(): Promise<string | undefined> {
        this.checkData();
        if (this.data) {
            const auth_code = randomInt(100, 999).toString();
            const auth_code_hash = Md5.hashStr(`${this.uid} ${auth_code}`);
            this.data.auth_code_hash = auth_code_hash;
            await this.save();
            return auth_code;
        }
    }
    
    static async getUserByTgUserId(tg_user_id: number): Promise<User | undefined> {
        MongoProto.connectMongo();
        const ou = await mongoUsers.aggregate([{
            '$match': {
                'tguserid': tg_user_id,
                'blocked': false
            }
        }]);
        if (ou.length) return new User(undefined, ou[0]);
    }

    async getOrganizationsUserAttachedTo(): Promise<Array<IOrganization>> {
        MongoProto.connectMongo();
        await this.checkData();

        const orgs = mongoOrgs.aggregate([{
            '$match': {'participants.uid': this.uid}
        }]);
        return orgs;
    }
}