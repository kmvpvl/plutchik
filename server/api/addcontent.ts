import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import Content, { ContentGroup, mongoContentGroup } from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';

export default async function addcontent(c: any, req: Request, res: Response) {
    let organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    const sessiontoken = req.headers["sessiontoken"];
    console.log(`${colours.fg.green}API: addcontent function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; user_id = '${userid}'; sessiontoken = '${sessiontoken}'${colours.reset}`);
    console.log(`${colours.fg.blue}contentinfo = '${JSON.stringify(req.body.contentinfo)}'; groups='${JSON.stringify(req.body.groups)}'${colours.reset}`);
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

        //lets check all prev groups
        let oldGroups = await mongoContentGroup.aggregate([
            {'$match': {
                'items':content.uid
            }},
            {'$project': {
                '_id': 1
            }}
        ]);
        if (req.body.groups) {
            for (const [i, g] of Object.entries(req.body.groups)){
                const group = await mongoContentGroup.aggregate([{
                    '$match': {
                        name: g
                    }
                }]);
                if (group.length) {
                    const og = new ContentGroup(undefined, group[0]);
                    await og.addItem(content.uid as Types.ObjectId);
                    // if this group is in list of oldGroup, delete it from oldGroups
                    oldGroups = oldGroups.filter((el)=>!new Types.ObjectId(og.uid).equals(el._id));
                } else {
                    const og: ContentGroup = new ContentGroup(undefined, {
                        name: g as string,
                        items:[content.uid as Types.ObjectId],
                        tags:[],
                        restrictions: [],
                        language: content.json?.language as string,
                        blocked: false,
                        created: new Date()
                    });
                    await og.save();
                }
            }
        }
        //must delete cid from any estimated group in oldGroups
        for (const [i, g] of Object.entries(oldGroups)) {
            const go = new ContentGroup(new Types.ObjectId(g._id as string));
            await go.load();
            await go.removeItem(content.uid as Types.ObjectId);
        }
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