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
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
const error_1 = __importDefault(require("../model/error"));
const organization_1 = __importDefault(require("../model/organization"));
const user_1 = __importDefault(require("../model/user"));
//import User from "../model/user";
function blockuser(c, req, res, block = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const organizationid = req.headers["organizationid"];
        const organizationkey = req.headers["organizationkey"];
        const userid = req.headers["userid"];
        console.log(`${colours_1.default.fg.green}API: blockuser function.${colours_1.default.reset}\n ${colours_1.default.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}; block = '${block}'${colours_1.default.reset}`);
        try {
            // Loading  organization data
            const org = new organization_1.default(new mongoose_1.Types.ObjectId(organizationid));
            yield org.load();
            // Checking organization key
            const roles = yield org.checkKeyAndGetRoles(new mongoose_1.Types.ObjectId(organizationkey));
            console.log(`${colours_1.default.fg.blue}roles = '${roles}'${colours_1.default.reset}`);
            if (!organization_1.default.checkRoles(roles, "manage_users"))
                throw new error_1.default("forbidden:rolerequiered", `manage_users role was expected`);
            // Checking user id
            const oUserid = new mongoose_1.Types.ObjectId(userid);
            const user = new user_1.default(oUserid);
            yield user.load();
            user.block(block);
            yield user.save();
            // looking for existing session
            return res.status(200).json();
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
