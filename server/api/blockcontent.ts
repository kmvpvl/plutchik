import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import Content from '../model/content';

export default async function blockuser(c: any, req: Request, res: Response, block = true) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const cid = c.request.params["cid"];
    console.log(`${colours.fg.green}API: blockcontent function.${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; cid = ${cid}; block = '${block}'${colours.reset}`);
    try {
        // Loading  organization data
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);
        if (!Organization.checkRoles(roles, "manage_content")) throw new PlutchikError("forbidden:rolerequiered", `manage_content role was expected`);
        // Checking user id
        const ocid = new Types.ObjectId(cid as string);
        const ci = new Content(ocid);
        await ci.load();
        ci.block(block);
        await ci.save();
        // looking for existing session
        return res.status(200).json();
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}