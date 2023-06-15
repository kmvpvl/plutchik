import { Types } from "mongoose";
import Organization from "../model/organization";
import User from "../model/user";
import { Request, Response } from 'express';
import colours from "../model/colours";

export default async function getnextcontentitem(c: any, req: Request, res: Response){
    const tguserid = req.headers["tguid"] as string;
    const sessiontoken = req.headers["plutchikauthsessiontoken"];
    console.log(`${colours.fg.green}API: getnextcontentitem function${colours.reset}\n ${colours.fg.blue}Parameters: tguserid = '${tguserid}'; sessiontoken = '${sessiontoken}'${colours.reset}`);
    const user = await User.getUserByTgUserId(parseInt(tguserid));
    if (user) {
        const org = new Organization(user.json?.organizationid);
        await org.load();
        const roles = await user.checkSessionToken(new Types.ObjectId(sessiontoken as string));
        //if (!Organization.checkRoles(roles, "getting_feed")) throw new ;
        const ci = await user.nextContentItem(undefined, user.json?.nativelanguage);
        return res.status(200).json({result: 'OK', content: ci, user:user.json, sessiontoken: sessiontoken});
    } else {
        return res.status(404).json({result: 'FAIL', description: 'User not found'});
    }
}