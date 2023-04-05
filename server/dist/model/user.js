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
const colours_1 = __importDefault(require("./colours"));
const content_1 = require("./content");
const error_1 = __importDefault(require("./error"));
const organization_1 = require("./organization");
const plutchikproto_1 = __importDefault(require("./plutchikproto"));
exports.UserSchema = new mongoose_1.Schema({
    organizationid: { type: mongoose_1.Types.ObjectId, require: false },
    tguserid: { type: Number, require: false },
    birthdate: { type: Date, require: false },
    nativelanguage: { type: String, require: false },
    secondlanguages: { type: (Array), require: false },
    location: { type: String, require: false },
    gender: { type: String, require: false },
    maritalstatus: { type: String, require: false },
    features: { type: String, require: false },
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: (Array),
});
exports.mongoUsers = (0, mongoose_1.model)('users', exports.UserSchema);
class User extends plutchikproto_1.default {
    load(data) {
        const _super = Object.create(null, {
            load: { get: () => super.load }
        });
        return __awaiter(this, void 0, void 0, function* () {
            plutchikproto_1.default.connectMongo();
            if (!data) {
                const users = yield exports.mongoUsers.aggregate([
                    {
                        '$match': {
                            '_id': this.id
                        }
                    }
                ]);
                if (1 != users.length)
                    throw new error_1.default("user:notfound", `id = '${this.id}'`);
                yield _super.load.call(this, users[0]);
            }
            else {
                yield _super.load.call(this, data);
            }
        });
    }
    checkData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data)
                throw new error_1.default("user:notloaded", `userid = '${this.id}'`);
        });
    }
    block(block = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.blocked = block;
            yield this.save();
        });
    }
    save() {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            plutchikproto_1.default.connectMongo();
            yield this.checkData();
            yield _super.save.call(this);
            if (this.id) {
                yield exports.mongoUsers.findByIdAndUpdate(this.id, this.data);
                console.log(`User data was successfully updated. User id = '${this.id}'`);
            }
            else {
                const userInserted = yield exports.mongoUsers.insertMany([this.data]);
                this.id = userInserted[0]._id;
                this.load(userInserted[0]);
                console.log(`New user was created. ${colours_1.default.fg.blue}User id = '${this.id}'${colours_1.default.reset}`);
            }
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
            plutchikproto_1.default.connectMongo();
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
    nextContentItem(language, source_type) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            //this.checkData();
            plutchikproto_1.default.connectMongo();
            const v = yield content_1.mongoContent.aggregate([{
                    $match: {
                        'language': {
                            '$regex': language ? language : (_a = this.json) === null || _a === void 0 ? void 0 : _a.nativelanguage,
                            '$options': 'i'
                        }
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
                    $limit: 1,
                }]);
            if (!v.length)
                throw new error_1.default("user:nonextcontent", `userid = '${this.id}';`);
            return v[0];
        });
    }
}
exports.default = User;
