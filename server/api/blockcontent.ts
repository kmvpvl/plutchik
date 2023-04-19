import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import Content from '../model/content';
import User from '../model/user';

export default async function blockuser(c: any, req: Request, res: Response, block = true) {
    let organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    const sessiontoken = req.headers["sessiontoken"];
    const cid = c.request.params["cid"];
    console.log(`${colours.fg.green}API: blockcontent function.${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; cid = ${cid}; block = '${block}'; user_id = '${userid}'; sessiontoken = '${sessiontoken}'${colours.reset}`);
    try {
        // Loading  organization data
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
        // Checking content id
        const ocid = new Types.ObjectId(cid as string);
        const ci = new Content(ocid);
        await ci.load();
        await ci.block(block);
        // looking for existing session
        return res.status(200).send();
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}