import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import Content, { ContentGroup, mongoContentGroup } from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';
import MongoProto from '../model/mongoproto';
import { mongoAssessments } from '../model/assessment';

export default async function getorgcontent(c: any, req: Request, res: Response, user: User) {
    const oid = req.body['oid'];
    console.log(`${colours.fg.green}API: getorgcontent function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${oid}'${colours.reset}`);
    try {
        const org = new Organization(new Types.ObjectId(oid));
        await org.load();
        if (!await org.checkRoles(user, "manage_content")) return res.status(403).json({err: 403, desc: `Role manage_content requires`});
        const ci = await org.getContentItems();
        return res.status(200).json(ci);
    } catch (e: any) {
        return res.status(404).json({ok: "FAIL", descriprion: `org_id=${oid}`});
    }
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
export async function getcontentstatistics(c: any, req: Request, res: Response, user: User) {
    let cid = req.body.cid;
    console.log(`${colours.fg.green}API: getcontentstatistics function${colours.reset}\n ${colours.fg.blue}Parameters: cid = '${cid}'${colours.reset}`);
    try {
        MongoProto.connectMongo();
        const stat = await mongoAssessments.aggregate([
            {'$match': {'cid': new Types.ObjectId(cid)}
            }, {'$group': {'_id': '$cid', 
                'joy': {'$avg': {'$toDouble': '$vector.joy'}}, 
                'trust': {'$avg': {'$toDouble': '$vector.trust'}}, 
                'fear': {'$avg': {'$toDouble': '$vector.fear'}}, 
                'surprise': {'$avg': {'$toDouble': '$vector.surprise'}}, 
                'sadness': {'$avg': {'$toDouble': '$vector.sadness'}}, 
                'disgust': {'$avg': {'$toDouble': '$vector.disgust'}}, 
                'anger': {'$avg': {'$toDouble': '$vector.anger'}}, 
                'anticipation': {'$avg': {'$toDouble': '$vector.anticipation'}}, 
                'count': {'$sum': 1}}
            }
        ]);
        if (stat.length === 1) return res.status(200).json(stat[0]);
        else return res.status(404).json({err: 'Content not found'});
    } catch (e: any) {
        return res.status(400).json(e);
    }
}
