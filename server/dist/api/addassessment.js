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
const assessment_1 = __importDefault(require("../model/assessment"));
const colours_1 = __importDefault(require("../model/colours"));
const user_1 = __importDefault(require("../model/user"));
function addassessment(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userid = req.headers["userid"];
        const sessiontoken = req.headers["sessiontoken"];
        console.log(`${colours_1.default.fg.green}API: addassessment function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: userid = '${userid}'; sessiontoken = '${sessiontoken}'${colours_1.default.reset}`);
        console.log(`${colours_1.default.fg.blue}assessmentinfo = '${JSON.stringify(req.body.assessmentinfo)}'${colours_1.default.reset}`);
        try {
            // load user object
            const user = new user_1.default(new mongoose_1.Types.ObjectId(userid));
            yield user.load();
            //checking active session and get roles
            const checkST = yield user.checkSesstionToken(new mongoose_1.Types.ObjectId(sessiontoken));
            console.log(`Checking session token successful. Roles = ${colours_1.default.fg.blue}${checkST}${colours_1.default.reset}`);
            //filling optional fields
            req.body.assessmentinfo.uid = new mongoose_1.Types.ObjectId(userid);
            req.body.assessmentinfo.created = new Date();
            // creating Assessment object for saving
            const a = new assessment_1.default(undefined, req.body.assessmentinfo);
            yield a.save();
            return res.status(200).json(a.json);
        }
        catch (e) {
            return res.status(400).json(e);
        }
    });
}
exports.default = addassessment;
