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
const mongoose_1 = require("mongoose");
const assessment_1 = require("../model/assessment");
const colours_1 = __importDefault(require("../model/colours"));
const content_1 = require("../model/content");
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = require("../model/user");
function organizationinfo(c, req, res) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        console.log(`${colours_1.default.fg.green}API: organizationinfo function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'`);
        try {
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const key = yield org.checkKey(new mongoose_1.Types.ObjectId(organizationkey));
            console.log(`${colours_1.default.fg.blue}roles = '${key.roles}'${colours_1.default.reset}`);
            //        if (!Organization.checkRoles(roles, "administrator")) throw new PlutchikError("forbidden:rolerequiered", `administrator role was expected`);
            const userscount = yield user_1.mongoUsers.aggregate([
                {
                    '$match': {
                        'organizationid': (_a = org.json) === null || _a === void 0 ? void 0 : _a._id,
                        'blocked': false
                    }
                }, {
                    '$count': 'count'
                }
            ]);
            const contentcount = yield content_1.mongoContent.aggregate([
                {
                    '$match': {
                        'organizationid': (_b = org.json) === null || _b === void 0 ? void 0 : _b._id,
                        'blocked': false
                    }
                }, {
                    '$count': 'count'
                }
            ]);
            const assessmentscount = yield assessment_1.mongoAssessments.aggregate([
                {
                    '$match': {
                        'organizationid': (_c = org.json) === null || _c === void 0 ? void 0 : _c._id,
                    }
                }, {
                    '$count': 'count'
                }
            ]);
            const ret = {
                name: (_d = org.json) === null || _d === void 0 ? void 0 : _d.name,
                keyname: key.keyname,
                keyroles: key.roles,
                keyscount: (_e = org.json) === null || _e === void 0 ? void 0 : _e.keys.length,
                userscount: userscount[0] ? userscount[0].count : 0,
                contentcount: contentcount[0] ? contentcount[0].count : 0,
                assessmentscount: assessmentscount[0] ? assessmentscount[0].count : 0
            };
            return res.status(200).json(ret);
        }
        catch (e) {
            switch (e.code) {
                case "forbidden:rolerequiered":
                    return res.status(401).json(e);
                default:
                    return res.status(400).json(e);
            }
        }
    });
}
exports.default = organizationinfo;
