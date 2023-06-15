"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoUsers = exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
const content_1 = require("./content");
const error_1 = __importDefault(require("./error"));
const organization_1 = require("./organization");
const assessment_1 = require("./assessment");
const mongoproto_1 = __importDefault(require("./mongoproto"));
const crypto_1 = require("crypto");
const ts_md5_1 = require("ts-md5");
exports.UserSchema = new mongoose_1.Schema({
    organizationid: { type: mongoose_1.Types.ObjectId, require: false },
    tguserid: { type: Number, require: false },
    birthdate: { type: Date, require: false },
    birthdateapproximately: { type: Boolean, require: false },
    nativelanguage: { type: String, require: false },
    secondlanguages: { type: (Array), require: false },
    location: { type: String, require: false },
    gender: { type: String, require: false },
    maritalstatus: { type: String, require: false },
    features: { type: String, require: false },
    assignedgroups: { type: Array, require: false },
    awaitcommanddata: { type: String, require: false },
    auth_code_hash: { type: String, require: false },
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: (Array),
});
exports.mongoUsers = (0, mongoose_1.model)('users', exports.UserSchema);
class User extends mongoproto_1.default {
    constructor(id, data) {
        super(exports.mongoUsers, id, data);
    }
    block(block = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.blocked = block;
            yield this.save();
        });
    }
    /**
     * Function check existing session token and increase its expired time
     * @param st session token
     * @param sessionminutes duration of session token
     * @returns list of roles on this session token
     */
    checkSessionToken(st, sessionminutes = organization_1.DEFAULT_SESSION_DURATION) {
        return __awaiter(this, void 0, void 0, function* () {
            mongoproto_1.default.connectMongo();
            const sts = yield organization_1.mongoSessionTokens.aggregate([{
                    '$match': {
                        'useridref': this.id,
                        '_id': st,
                        'expired': { '$gte': new Date() }
                    }
                }]);
            if (!sts.length)
                throw new error_1.default("user:hasnoactivesession", `userid = '${this.id}'; sessiontoken = '${st}'`);
            const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
            if (sts[0].expired < nexpired)
                yield organization_1.mongoSessionTokens.findByIdAndUpdate(sts[0]._id, { expired: nexpired });
            console.log(`Session token updated: id = '${sts[0]._id}'; new expired = '${nexpired}'`);
            return sts[0].roles;
        });
    }
    changeNativeLanguage(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.nativelanguage = lang;
            yield this.save();
        });
    }
    setAge(age) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                let d = new Date();
                d.setFullYear(d.getFullYear() - age);
                this.data.birthdate = d;
                this.data.birthdateapproximately = true;
            }
            yield this.save();
        });
    }
    setGender(gender) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                this.data.gender = gender;
            }
            yield this.save();
        });
    }
    setAwaitCommandData(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                this.data.awaitcommanddata = cmd;
                if (!cmd)
                    delete this.data.awaitcommanddata;
            }
            yield this.save();
        });
    }
    deleteTgUser() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                this.data.tguserid = -1;
            }
            yield this.save();
        });
    }
    nextContentItemByAssign(groupid, assignid, bot) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            mongoproto_1.default.connectMongo();
            const v = yield content_1.mongoContentGroup.aggregate([
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
                                    '$expr': { '$eq': [
                                            '$assignid', assignid
                                        ] }
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
                }, {
                    '$limit': 1
                }, {
                    '$project': {
                        'result': 0,
                        'rand': 0
                    }
                }
            ]);
            if (!v.length) {
                //let's close assignment of content grooup
                (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.assignedgroups) === null || _b === void 0 ? void 0 : _b.forEach(el => { if (el._id.equals(assignid))
                    el.closed = true; });
                yield this.save();
                //let's notify all about finish of the assessment
                const c = (_d = (_c = this.data) === null || _c === void 0 ? void 0 : _c.assignedgroups) === null || _d === void 0 ? void 0 : _d.filter(el => el._id.equals(assignid));
                if (c)
                    bot === null || bot === void 0 ? void 0 : bot.sendMessage(c[0].tguserid, `User ${this.uid} finished ${c[0]._id} assignment`);
                throw new error_1.default("user:nonextcontent", `userid = '${this.id}';assignid='${assignid}';groupid='${groupid}'`);
            }
            //let's mark content item as asessed by assignment froup
            v[0].assignid = assignid;
            return v[0];
        });
    }
    nextContentItem(bot, language, source_type) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            const assigns = (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.assignedgroups) === null || _b === void 0 ? void 0 : _b.filter((val) => !val.closed);
            if (assigns === null || assigns === void 0 ? void 0 : assigns.length) {
                return this.nextContentItemByAssign(assigns[0].groupid, assigns[0]._id, bot);
            }
            else {
                return this.nextContentItemAll(language, source_type);
            }
        });
    }
    nextContentItemAll(language, source_type) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            //this.checkData();
            mongoproto_1.default.connectMongo();
            const v = yield content_1.mongoContent.aggregate([{
                    $match: {
                        'language': {
                            '$regex': language ? language : (_a = this.json) === null || _a === void 0 ? void 0 : _a.nativelanguage,
                            '$options': 'i'
                        },
                        'blocked': false
                    }
                }, { $lookup: {
                        from: "assessments",
                        let: {
                            contentid: "$_id",
                        },
                        pipeline: [{
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: [this.id, "$uid",] },
                                            { $eq: ["$cid", "$$contentid"] },
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
                }, {
                    $limit: 1,
                }]);
            if (!v.length)
                throw new error_1.default("user:nonextcontent", `userid = '${this.id}';`);
            return v[0];
        });
    }
    observeAssessments() {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = {
                ownVector: {},
                othersVector: {}
            };
            yield this.checkData();
            if (this.id) {
                const own = yield assessment_1.mongoAssessments.aggregate([
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
                    }, {
                        '$project': {
                            '_id': 0
                        }
                    }
                ]);
                ret.ownVector = own[0];
                const others = yield assessment_1.mongoAssessments.aggregate([
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
        });
    }
    assignContentGroup(from, group) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            const a = {
                _id: new mongoose_1.Types.ObjectId(),
                userid: from.uid,
                tguserid: (_a = from.json) === null || _a === void 0 ? void 0 : _a.tguserid,
                groupid: group.uid,
                assigndate: new Date(),
                closed: false
            };
            if (this.data && !((_b = this.data) === null || _b === void 0 ? void 0 : _b.assignedgroups))
                this.data.assignedgroups = [];
            // let's check the same not closed group exists
            const exists = (_d = (_c = this.data) === null || _c === void 0 ? void 0 : _c.assignedgroups) === null || _d === void 0 ? void 0 : _d.filter((val) => val.groupid.equals(group.uid));
            if (!(exists === null || exists === void 0 ? void 0 : exists.length))
                (_f = (_e = this.data) === null || _e === void 0 ? void 0 : _e.assignedgroups) === null || _f === void 0 ? void 0 : _f.push(a);
            yield this.save();
        });
    }
    createAuthCode() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkData();
            if (this.data) {
                const auth_code = (0, crypto_1.randomInt)(100, 999).toString();
                const auth_code_hash = ts_md5_1.Md5.hashStr(`${(_a = this.json) === null || _a === void 0 ? void 0 : _a.tguserid} ${auth_code}`);
                this.data.auth_code_hash = auth_code_hash;
                yield this.save();
                return auth_code;
            }
        });
    }
    static getUserByTgUserId(tg_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            mongoproto_1.default.connectMongo();
            const ou = yield exports.mongoUsers.aggregate([{
                    '$match': {
                        'tguserid': tg_user_id,
                        'blocked': false
                    }
                }]);
            if (ou.length)
                return new User(undefined, ou[0]);
        });
    }
}
exports.default = User;
