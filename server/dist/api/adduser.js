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
const colours_1 = __importDefault(require("../model/colours"));
const error_1 = __importDefault(require("../model/error"));
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = __importDefault(require("../model/user"));
function adduser(c, req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const userid = req.headers["userid"];
        console.log(`${colours_1.default.fg.green}API: adduser function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}${colours_1.default.reset}`);
        console.log(`${colours_1.default.fg.blue}userinfo = '${JSON.stringify(req.body.userinfo)}'${colours_1.default.reset}`);
        try {
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
            console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
            if (!organization_1.default.checkRoles(roles, "manage_users"))
                throw new error_1.default("forbidden:rolerequiered", `manage_users role was expected`);
            req.body.userinfo.organizationid = (_a = org.json) === null || _a === void 0 ? void 0 : _a._id;
            let user;
            if (userid) {
                // update existing user
                user = new user_1.default(new mongoose_1.Types.ObjectId(userid));
                yield user.load();
                //need to check that user belongs that organization
                if (!new mongoose_1.Types.ObjectId(organizationid).equals((_b = user.json) === null || _b === void 0 ? void 0 : _b.organizationid))
                    throw new error_1.default("user:notfound", `organizationid = '${organizationid}' is wrong, userid = '${userid}'`);
                const d = user.clone();
                for (const p in req.body.userinfo) {
                    d[p] = req.body.userinfo[p];
                }
                yield user.load(d);
            }
            else {
                // create new user
                req.body.userinfo.created = new Date();
                user = new user_1.default(undefined, req.body.userinfo);
            }
            yield user.save();
            return res.status(200).json(user.json);
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
exports.default = adduser;
