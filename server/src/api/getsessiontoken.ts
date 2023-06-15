import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';
import { Md5 } from 'ts-md5';
//import User from "../model/user";

export async function tggetsessiontoken(c: any, req: Request, res: Response) {
    const userid = parseInt(req.headers["tg_userid"] as string);
    const auth_code = req.headers["tg_auth_code"];
    console.log(`${colours.fg.green}API: tggetsessiontoken function.${colours.reset}\n ${colours.fg.blue}Parameters: userid = '${userid}'; auth_code = '${auth_code}';${colours.reset}`);
    try {
        const user = await User.getUserByTgUserId(userid);
        if (!user) throw new PlutchikError("user:notfound", `tg_user_id='${userid}'; tg_auth_code='${auth_code}'`);
        const hash = Md5.hashStr(`${userid} ${auth_code}`);
        if (hash !== user.json?.auth_code_hash) throw new PlutchikError("organization:wrongkey", `tg_user_id='${userid}'; tg_auth_code='${auth_code}'`)
        const org = new Organization(user.json?.organizationid);
        await org.load();
        let isContentManageRole = false;
        const key = await org.checkTgUserId(userid);
        isContentManageRole = Organization.checkRoles(key.roles, "manage_content");

        // looking for existing session
        return res.status(200).json(await org.checkAndUpdateSessionToken(user.uid, key.roles));
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}


export default async function getsessiontoken(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    console.log(`${colours.fg.green}API: getsessiontoken function.${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}${colours.reset}`);
    try {
        // Loading  organization data
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);
        if (!Organization.checkRoles(roles, "mining_session")) throw new PlutchikError("forbidden:rolerequiered", `mining_session role was expected`);
        // Checking user id
        const oUserid = new Types.ObjectId(userid as string);
        const user = new User(oUserid);
        await user.load();

        // looking for existing session
        return res.status(200).json(await org.checkAndUpdateSessionToken(oUserid, roles));
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}