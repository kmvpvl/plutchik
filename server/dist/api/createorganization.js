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
const colours_1 = __importDefault(require("../model/colours"));
const organization_1 = __importDefault(require("../model/organization"));
function createorganization(c, req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // const organizationid = req.headers["organizationid"];
        // const organizationkey = req.headers["organizationkey"];
        const name = req.body.name;
        const emails = req.body.emails;
        console.log(`${colours_1.default.fg.green}API: createorganization function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: name = '${name}'; roles = '${emails}'`);
        try {
            const orgData = {
                name: name,
                keys: [],
                emails: emails,
                created: new Date(),
                changed: new Date()
            };
            const org = new organization_1.default(undefined, orgData);
            yield org.save();
            const oNK = yield org.addKey("Administrator", ["administrator"]);
            return res.status(200).json({
                organizationid: (_a = org.json) === null || _a === void 0 ? void 0 : _a._id,
                organizationkey: oNK.toString()
            });
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
exports.default = createorganization;
