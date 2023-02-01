import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import Content from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';

export default async function addcontent(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    console.log(`${colours.fg.green}API: addcontent function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'${colours.reset}`);
    console.log(`${colours.fg.blue}contentinfo = '${JSON.stringify(req.body.contentinfo)}'${colours.reset}`);
    try {
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);

        if (!Organization.checkRoles(roles, "manage_content")) throw new PlutchikError("forbidden:rolerequiered", `manage_content role was expected`);

        req.body.contentinfo.organizationid = organizationid;
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