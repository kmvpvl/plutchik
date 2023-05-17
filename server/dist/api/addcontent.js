"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const content_1 = __importStar(require("../model/content"));
const error_1 = __importDefault(require("../model/error"));
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = __importDefault(require("../model/user"));
function addcontent(c, req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const userid = req.headers["userid"];
        const sessiontoken = req.headers["sessiontoken"];
        console.log(`${colours_1.default.fg.green}API: addcontent function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; user_id = '${userid}'; sessiontoken = '${sessiontoken}'${colours_1.default.reset}`);
        console.log(`${colours_1.default.fg.blue}contentinfo = '${JSON.stringify(req.body.contentinfo)}'; groups='${JSON.stringify(req.body.groups)}'${colours_1.default.reset}`);
        try {
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
            req.body.contentinfo.organizationid = new mongoose_1.Types.ObjectId(organizationid);
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
            //lets check all prev groups
            let oldGroups = yield content_1.mongoContentGroup.aggregate([
                { '$match': {
                        'items': content.uid
                    } },
                { '$project': {
                        '_id': 1
                    } }
            ]);
            if (req.body.groups) {
                for (const [i, g] of Object.entries(req.body.groups)) {
                    let og = yield (0, content_1.findContentGroup)(g);
                    if (og) {
                        yield og.addItem(content.uid);
                        // if this group is in list of oldGroup, delete it from oldGroups
                        oldGroups = oldGroups.filter((el) => !new mongoose_1.Types.ObjectId(og.uid).equals(el._id));
                    }
                    else {
                        og = new content_1.ContentGroup(undefined, {
                            name: g,
                            items: [content.uid],
                            tags: [],
                            restrictions: [],
                            language: (_c = content.json) === null || _c === void 0 ? void 0 : _c.language,
                            blocked: false,
                            created: new Date()
                        });
                        yield og.save();
                    }
                }
            }
            //must delete cid from any estimated group in oldGroups
            for (const [i, g] of Object.entries(oldGroups)) {
                const go = new content_1.ContentGroup(new mongoose_1.Types.ObjectId(g._id));
                yield go.load();
                yield go.removeItem(content.uid);
            }
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
