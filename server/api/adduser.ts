import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError from '../model/error';
import Organization from '../model/organization';
import User from "../model/user";

export default async function adduser(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    console.log(`${colours.fg.green}API: adduser function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}${colours.reset}`);
    console.log(`${colours.fg.blue}userinfo = '${JSON.stringify(req.body.userinfo)}'${colours.reset}`);
    try {
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);

        req.body.userinfo.organizationid = organizationid;
        let user: User;
        if (userid) {
            // update existing user
            user = new User(new Types.ObjectId(userid as string));
            await user.load();
            //need to check that user belongs that organization
            if (!new Types.ObjectId(organizationid as string).equals(user.json?.organizationid as Types.ObjectId)) throw new PlutchikError("user:notfound", `organizationid = '${organizationid}' is wrong, userid = '${userid}'`);
            const d = user.clone();
            for (const p in req.body.userinfo) {
                (d as any)[p] = req.body.userinfo[p];
            }
            await user.load(d);
        } else {
            // create new user
            req.body.userinfo.created = new Date();
            user = new User(undefined, req.body.userinfo);
        }
        await user.save();
        return res.status(200).json(user.json);
    } catch (e: any) {
        return res.status(400).json(e);
    }
}