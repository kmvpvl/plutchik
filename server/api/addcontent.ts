import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import Content from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';

export default async function addcontent(c: any, req: Request, res: Response) {
    let organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    const sessiontoken = req.headers["sessiontoken"];
    console.log(`${colours.fg.green}API: addcontent function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; user_id = '${userid}'; sessiontoken = '${sessiontoken}'${colours.reset}`);
    console.log(`${colours.fg.blue}contentinfo = '${JSON.stringify(req.body.contentinfo)}'${colours.reset}`);
    try {
        let user:User = new User(new Types.ObjectId(userid as string));
        if (!organizationid) {
            await user.load();
            organizationid = user.json?.organizationid?.toString();
        }
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        if (organizationkey){
            // Checking organization key
            const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
            console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);

            if (!Organization.checkRoles(roles, "manage_content")) throw new PlutchikError("forbidden:rolerequiered", `manage_content role was expected`);
        } else {
            //check session token roles
            const checkST = await user.checkSessionToken(new Types.ObjectId(sessiontoken as string));
            console.log(`Checking session token successful. Roles = ${colours.fg.blue}${checkST}${colours.reset}`);
            if (!Organization.checkRoles(checkST, "manage_content")) throw new PlutchikError("forbidden:rolerequiered", `manage_content role was expected`);
        }

        req.body.contentinfo.organizationid = new Types.ObjectId(organizationid as string);
        const cid = req.body.contentinfo._id;
        let content: Content;
         if (cid) {
            // update existing item
            content = new Content(new Types.ObjectId(cid as string));
            await content.load();
            const d = content.clone();
            for (const p in req.body.contentinfo) {
                (d as any)[p] = req.body.contentinfo[p];
            }
            await content.load(d);
        } else {
            // create new content item
            req.body.contentinfo.created = new Date();
            content = new Content(undefined, req.body.contentinfo);
        }
        await content.save();
        return res.status(200).json(content.json);
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}