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
exports.mongoSessionTokens = exports.mongoOrgs = exports.OrganizationSchema = exports.SessionTokenSchema = exports.DEFAULT_SESSION_DURATION = void 0;
const mongoose_1 = require("mongoose");
const error_1 = __importDefault(require("./error"));
const plutchikproto_1 = __importDefault(require("./plutchikproto"));
const ts_md5_1 = require("ts-md5");
const colours_1 = __importDefault(require("./colours"));
const content_1 = require("./content");
exports.DEFAULT_SESSION_DURATION = 30;
exports.SessionTokenSchema = new mongoose_1.Schema({
    organizationidref: mongoose_1.Types.ObjectId,
    useridref: mongoose_1.Types.ObjectId,
    created: Date,
    expired: Date,
    roles: (Array)
});
exports.OrganizationSchema = new mongoose_1.Schema({
    name: String,
    keys: [],
    emails: [],
    created: Date,
    changed: Date,
    history: (Array),
});
exports.mongoOrgs = (0, mongoose_1.model)('organizations', exports.OrganizationSchema);
exports.mongoSessionTokens = (0, mongoose_1.model)('sessiontokens', exports.SessionTokenSchema);
class Organization extends plutchikproto_1.default {
    load(data) {
        const _super = Object.create(null, {
            load: { get: () => super.load }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!data) {
                plutchikproto_1.default.connectMongo();
                const org = yield exports.mongoOrgs.aggregate([{
                        '$match': {
                            '_id': this.id
                        }
                    }]);
                if (1 != org.length)
                    throw new error_1.default("organization:notfound", `id = '${this.id}'`);
                yield _super.load.call(this, org[0]);
            }
            else {
                yield _super.load.call(this, data);
            }
        });
    }
    addKey(name, roles) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            const oNK = new mongoose_1.Types.ObjectId();
            const md5 = ts_md5_1.Md5.hashStr(`${this.id} ${oNK}`);
            const nk = {
                keyname: name,
                roles: roles,
                keyhash: md5,
                created: new Date()
            };
            (_a = this.data) === null || _a === void 0 ? void 0 : _a.keys.push(nk);
            yield this.save();
            return oNK;
        });
    }
    removeKey(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // never remove first organization key
            if (id)
                (_a = this.data) === null || _a === void 0 ? void 0 : _a.keys.splice(id, 1);
            yield this.save();
        });
    }
    checkTgUserId(userId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data)
                throw new error_1.default("organization:notloaded", `id = '${this.id}'`);
            for (const key of (_a = this.data) === null || _a === void 0 ? void 0 : _a.keys) {
                if (key.tgUserId == userId) {
                    return key;
                }
            }
            throw new error_1.default("organization:wrongtguserid", `organizationid = '${this.id}'; tgUserId = '${userId}'`);
        });
    }
    checkKey(key) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const md5 = ts_md5_1.Md5.hashStr(`${this.id} ${key}`);
            if (!this.data)
                throw new error_1.default("organization:notloaded", `id = '${this.id}'`);
            for (const key of (_a = this.data) === null || _a === void 0 ? void 0 : _a.keys) {
                if (key.keyhash == md5) {
                    return key;
                }
            }
            throw new error_1.default("organization:wrongkey", `organizationid = '${this.id}'; organizationkey = '${key}'`);
        });
    }
    /**
     * Function checks pair organizationid and organizationkey. If pair is right then returns list of roles
     * @param key is key uuid
     * @returns list of roles
     */
    checkKeyAndGetRoles(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.checkKey(key)).roles;
        });
    }
    /**
     * Function finds the actual session token and update its expired time or create new session token with exact roles
     * @param uid User id
     * @param roles list of roles
     * @param sessionminutes default time of session period in minutes
     * @returns id of session token
     */
    checkAndUpdateSessionToken(uid, roles, sessionminutes = exports.DEFAULT_SESSION_DURATION) {
        return __awaiter(this, void 0, void 0, function* () {
            const sts = yield exports.mongoSessionTokens.aggregate([{
                    '$match': {
                        'organizationidref': this.id,
                        'useridref': uid,
                        'expired': { '$gte': new Date() }
                    }
                }]);
            if (1 < sts.length)
                throw new error_1.default("user:multiplesession", `organizationid = '${this.id}'; userid = '${uid}'`);
            console.log(`Active session token(s) found: ${sts.length}`);
            if (!sts.length) {
                const st = yield exports.mongoSessionTokens.insertMany([{
                        organizationidref: this.id,
                        useridref: uid,
                        expired: new Date(new Date().getTime() + sessionminutes * 60000),
                        roles: roles,
                        created: new Date()
                    }]);
                console.log(`New session token created: id = '${st[0]._id}'`);
                return st[0]._id;
            }
            else {
                const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
                if (sts[0].expired < nexpired)
                    yield exports.mongoSessionTokens.findByIdAndUpdate(sts[0]._id, { expired: nexpired });
                console.log(`Session token updated: id = '${sts[0]._id}'`);
                return sts[0]._id;
            }
        });
    }
    static checkRoles(roles_had, role_to_find) {
        const superivor_role = "supervisor";
        if (roles_had.includes(superivor_role))
            return true;
        return roles_had.includes(role_to_find);
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
                yield exports.mongoOrgs.findByIdAndUpdate(this.id, this.data);
                console.log(`Organization data was successfully updated. Org id = '${this.id}'`);
            }
            else {
                const orgInserted = yield exports.mongoOrgs.insertMany([this.data]);
                this.id = orgInserted[0]._id;
                this.load(orgInserted[0]);
                console.log(`New organization was created. ${colours_1.default.fg.blue}Org id = '${this.id}'${colours_1.default.reset}`);
            }
        });
    }
    getFirstLettersOfContentItems() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            const letters = yield content_1.mongoContent.aggregate([
                {
                    '$match': {
                        'organizationid': this.id
                    }
                }, {
                    '$project': {
                        'l': {
                            '$substrCP': [
                                '$name', 0, 1
                            ]
                        }
                    }
                }, {
                    '$group': {
                        '_id': '$l',
                        'count': {
                            '$sum': 1
                        }
                    }
                }, {
                    '$sort': {
                        '_id': 1
                    }
                }
            ]);
            return letters;
        });
    }
    getContentItems() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            const ci = yield content_1.mongoContent.aggregate([
                { '$match': {
                        'organizationid': this.id
                    } }
            ]);
            return ci;
        });
    }
}
exports.default = Organization;
