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
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = __importDefault(require("../model/user"));
const colours_1 = __importDefault(require("../model/colours"));
function getnextcontentitem(c, req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const tguserid = req.headers["tguid"];
        const sessiontoken = req.headers["plutchikauthsessiontoken"];
        console.log(`${colours_1.default.fg.green}API: getnextcontentitem function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: tguserid = '${tguserid}'; sessiontoken = '${sessiontoken}'${colours_1.default.reset}`);
        const user = yield user_1.default.getUserByTgUserId(parseInt(tguserid));
        if (user) {
            const org = new organization_1.default((_a = user.json) === null || _a === void 0 ? void 0 : _a.organizationid);
            yield org.load();
            const roles = yield user.checkSessionToken(new mongoose_1.Types.ObjectId(sessiontoken));
            //if (!Organization.checkRoles(roles, "getting_feed")) throw new ;
            const ci = yield user.nextContentItem(undefined, (_b = user.json) === null || _b === void 0 ? void 0 : _b.nativelanguage);
            return res.status(200).json({ result: 'OK', content: ci, user: user.json, sessiontoken: sessiontoken });
        }
        else {
            return res.status(404).json({ result: 'FAIL', description: 'User not found' });
        }
    });
}
exports.default = getnextcontentitem;
