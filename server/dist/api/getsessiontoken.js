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
exports.tggetsessiontoken = void 0;
const mongoose_1 = require("mongoose");
const colours_1 = __importDefault(require("../model/colours"));
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
const error_1 = __importDefault(require("../model/error"));
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = __importDefault(require("../model/user"));
const ts_md5_1 = require("ts-md5");
//import User from "../model/user";
function tggetsessiontoken(c, req, res) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const userid = parseInt(req.headers["tg_userid"]);
        const auth_code = req.headers["tg_auth_code"];
        console.log(`${colours_1.default.fg.green}API: tggetsessiontoken function.${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: userid = '${userid}'; auth_code = '${auth_code}';${colours_1.default.reset}`);
        try {
            const user = yield user_1.default.getUserByTgUserId(userid);
            if (!user)
                throw new error_1.default("user:notfound", `tg_user_id='${userid}'; tg_auth_code='${auth_code}'`);
            const hash = ts_md5_1.Md5.hashStr(`${userid} ${auth_code}`);
            if (hash !== ((_a = user.json) === null || _a === void 0 ? void 0 : _a.auth_code_hash))
                throw new error_1.default("organization:wrongkey", `tg_user_id='${userid}'; tg_auth_code='${auth_code}'`);
            const org = new organization_1.default((_b = user.json) === null || _b === void 0 ? void 0 : _b.organizationid);
            yield org.load();
            let isContentManageRole = false;
            const key = yield org.checkTgUserId(userid);
            isContentManageRole = organization_1.default.checkRoles(key.roles, "manage_content");
            // looking for existing session
            return res.status(200).json(yield org.checkAndUpdateSessionToken(user.uid, key.roles));
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
exports.tggetsessiontoken = tggetsessiontoken;
function getsessiontoken(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const userid = req.headers["userid"];
        console.log(`${colours_1.default.fg.green}API: getsessiontoken function.${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}${colours_1.default.reset}`);
        try {
            // Loading  organization data
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
            console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
            if (!organization_1.default.checkRoles(roles, "mining_session"))
                throw new error_1.default("forbidden:rolerequiered", `mining_session role was expected`);
            // Checking user id
            const oUserid = new mongoose_1.Types.ObjectId(userid);
            const user = new user_1.default(oUserid);
            yield user.load();
            // looking for existing session
            return res.status(200).json(yield org.checkAndUpdateSessionToken(oUserid, roles));
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
exports.default = getsessiontoken;
