import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import Content, { ContentGroup, mongoContentGroup } from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';

export default async function getorgcontent(c: any, req: Request, res: Response, user: User) {
    const oid = req.body['oid'];
    console.log(`${colours.fg.green}API: getorgcontent function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${oid}'${colours.reset}`);
    const org = new Organization(new Types.ObjectId(oid));
    await org.load();
    if (!await org.checkRoles(user, "manage_content")) return res.status(403).json({err: 403, desc: `Role manage_content requires`});
    const ci = await org.getContentItems();
    return res.status(200).json(ci);
}

export async function addcontent(c: any, req: Request, res: Response, user: User) {
    const contentitem = req.body.contentinfo;
    let groups = req.body.groups;
    console.log(`${colours.fg.green}API: addcontent function${colours.reset}\n ${colours.fg.blue}Parameters: contentinfo = '${JSON.stringify(req.body.contentinfo)}'; groups='${JSON.stringify(req.body.groups)}'${colours.reset}`);
    try {
        const org = new Organization(new Types.ObjectId(contentitem.organizationid));
        await org.load();
        if (!await org.checkRoles(user, "manage_content")) return res.status(403).json({err: 403, desc: `Role manage_content requires`}); 
        if (contentitem.groups) groups = contentitem.groups;
        delete contentitem.groups;

        contentitem.organizationid = new Types.ObjectId(contentitem.organizationid);
        const cid = contentitem._id;
        let content: Content;
        if (cid) {
            // update existing item
            content = new Content(new Types.ObjectId(cid));
            await content.load();
            const d = content.clone();
            for (const p in contentitem) {
                (d as any)[p] = contentitem[p];
            }
            await content.load(d);
        } else {
            // create new content item
            contentitem.created = new Date();
            content = new Content(undefined, contentitem);
        }
        await content.save();
        await content.assignGroups(groups);
        return res.status(200).json(content.json);
    } catch (e: any) {
        return res.status(400).json(e);
    }
}
