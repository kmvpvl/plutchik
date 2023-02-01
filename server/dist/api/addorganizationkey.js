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
function adduser(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const key_name = req.body.name;
        const key_roles = req.body.roles;
        console.log(`${colours_1.default.fg.green}API: addorganizationkey function${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; name = '${key_name}'; roles = '${key_roles}'`);
        try {
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
            if (!organization_1.default.checkRoles(roles, "administrator"))
                throw new error_1.default("forbidden:rolerequiered", `administrator role was expected`);
            console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
            const oNK = yield org.addKey(key_name, key_roles);
            return res.status(200).json(oNK.toString());
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
