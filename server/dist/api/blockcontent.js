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
const content_1 = __importDefault(require("../model/content"));
const user_1 = __importDefault(require("../model/user"));
function blockuser(c, req, res, block = true) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const userid = req.headers["userid"];
        const sessiontoken = req.headers["sessiontoken"];
        const cid = c.request.params["cid"];
        console.log(`${colours_1.default.fg.green}API: blockcontent function.${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; cid = ${cid}; block = '${block}'; user_id = '${userid}'; sessiontoken = '${sessiontoken}'${colours_1.default.reset}`);
        try {
            // Loading  organization data
            let user = new user_1.default(new mongoose_1.Types.ObjectId(userid));
            if (!organizationid) {
                yield user.load();
                organizationid = (_b = (_a = user.json) === null || _a === void 0 ? void 0 : _a.organizationid) === null || _b === void 0 ? void 0 : _b.toString();
            }
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            if (organizationkey) {
                // Checking organization key
                const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
                console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
                if (!organization_1.default.checkRoles(roles, "manage_content"))
                    throw new error_1.default("forbidden:rolerequiered", `manage_content role was expected`);
            }
            else {
                //check session token roles
                const checkST = yield user.checkSessionToken(new mongoose_1.Types.ObjectId(sessiontoken));
                console.log(`Checking session token successful. Roles = ${colours_1.default.fg.blue}${checkST}${colours_1.default.reset}`);
                if (!organization_1.default.checkRoles(checkST, "manage_content"))
                    throw new error_1.default("forbidden:rolerequiered", `manage_content role was expected`);
            }
            // Checking content id
            const ocid = new mongoose_1.Types.ObjectId(cid);
            const ci = new content_1.default(ocid);
            yield ci.load();
            yield ci.block(block);
            // looking for existing session
            return res.status(200).send();
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
exports.default = blockuser;
