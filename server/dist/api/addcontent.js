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
const content_1 = __importDefault(require("../model/content"));
const error_1 = __importDefault(require("../model/error"));
const organization_1 = __importDefault(require("../model/organization"));
function addcontent(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        console.log(`${colours_1.default.fg.green}API: addcontent function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'${colours_1.default.reset}`);
        console.log(`${colours_1.default.fg.blue}contentinfo = '${JSON.stringify(req.body.contentinfo)}'${colours_1.default.reset}`);
        try {
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
            console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
            if (!organization_1.default.checkRoles(roles, "manage_content"))
                throw new error_1.default("forbidden:rolerequiered", `manage_content role was expected`);
            req.body.contentinfo.organizationid = organizationid;
            const cid = req.body.contentinfo._id;
            let content;
            if (cid) {
                // update existing item
                content = new content_1.default(new mongoose_1.Types.ObjectId(cid));
                yield content.load();
                const d = content.clone();
                for (const p in req.body.contentinfo) {
                    d[p] = req.body.contentinfo[p];
                }
                yield content.load(d);
            }
            else {
                // create new content item
                req.body.contentinfo.created = new Date();
                content = new content_1.default(undefined, req.body.contentinfo);
            }
            yield content.save();
            return res.status(200).json(content.json);
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
exports.default = addcontent;
