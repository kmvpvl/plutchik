import { Schema, Types, model } from "mongoose";
import colours from "./colours";
import { IContent, mongoContent, SourceType } from "./content";
import PlutchikError from "./error";
import IMLString, {MLStringSchema} from "./mlstring";
import { DEFAULT_SESSION_DURATION, mongoSessionTokens } from "./organization";
import PlutchikProto from "./plutchikproto";
import { IVector, mongoAssessments } from "./assessment";

export type RoleType = "supervisor"|"administrator"|"manage_users"|"manage_content"|"mining_session"|"create_assessment"|"getting_feed"|"getting_match";
export interface IUser {
    _id?: Types.ObjectId;
    tguserid?: number;
    organizationid?: Types.ObjectId;
    birthdate?: Date;
    birthdateapproximately?: boolean;
    nativelanguage?: string;
    secondlanguages?: Array<string>,
    location?: string;
    gender?: string;
    maritalstatus?: string;
    features?: string;
    blocked: boolean;
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
    organizationid: {type: Types.ObjectId, require: false},
    tguserid: {type: Number, require: false},
    birthdate: {type: Date, require: false},
    birthdateapproximately: {type: Boolean, require: false},
    nativelanguage: {type: String, require: false},
    secondlanguages: {type: Array<string>, require: false},
    location: {type: String, require: false},
    gender: {type: String, require: false},
    maritalstatus: {type: String, require: false},
    features: {type: String, require: false},
    awaitcommanddata: {type: String, require: false},
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoUsers = model<IUser>('users', UserSchema);

export default class User extends PlutchikProto<IUser> {
    public async load(data?: IUser) {
        PlutchikProto.connectMongo();
        if (!data) {
            const users = await mongoUsers.aggregate([
                {
                    '$match': {
                        '_id': this.id
                    } 
                }
            ]);
            if (1 != users.length) throw new PlutchikError("user:notfound", `id = '${this.id}'`)
            await super.load(users[0]);
        } else {
            await super.load(data);
        }
    }
    protected async checkData(): Promise<void> {
        if (!this.data) throw new PlutchikError("user:notloaded", `userid = '${this.id}'`);
    }
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }
    public async save() {
        PlutchikProto.connectMongo();
        await this.checkData();
        await super.save();
        if (this.id){
            await mongoUsers.findByIdAndUpdate(this.id, this.data, {overwrite:true});
            console.log(`User data was successfully updated. User id = '${this.id}'`);
        } else { 
            const userInserted = await mongoUsers.insertMany([this.data]);
            this.id = userInserted[0]._id;
            this.load(userInserted[0]);
            console.log(`New user was created. ${colours.fg.blue}User id = '${this.id}'${colours.reset}`);
        }
    }

    /**
     * Function check existing session token and increase its expired time
     * @param st session token
     * @param sessionminutes duration of session token
     * @returns list of roles on this session token
     */
    public async checkSessionToken(st: Types.ObjectId, sessionminutes = DEFAULT_SESSION_DURATION): Promise<Array<RoleType>> {
        PlutchikProto.connectMongo();
        const sts = await mongoSessionTokens.aggregate([{
            '$match': {
                'useridref': this.id,
                '_id': st,
                'expired': {'$gte': new Date()}
            }
        }]);
        if (!sts.length) throw new PlutchikError("user:hasnoactivesession", `userid = '${this.id}'; sessiontoken = '${st}'`)
        const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
        if (sts[0].expired < nexpired) await mongoSessionTokens.findByIdAndUpdate(sts[0]._id, {expired:nexpired});
        console.log(`Session token updated: id = '${sts[0]._id}'; new expired = '${nexpired}'`);
        return sts[0].roles;
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

    public async nextContentItem(language?: string, source_type?: SourceType): Promise <IContent>{
        //this.checkData();
        PlutchikProto.connectMongo();
        const v = await mongoContent.aggregate([{
            $match: {
                'language': {
                    '$regex': language?language:this.json?.nativelanguage, 
                    '$options': 'i'
                },
                'blocked': false
            }
        },{$lookup: {
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
}