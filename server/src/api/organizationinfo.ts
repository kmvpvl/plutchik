import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { mongoAssessments } from '../model/assessment';
import colours from '../model/colours';
import { mongoContent } from '../model/content';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { IKey } from '../model/organization';
import { mongoUsers } from '../model/user';

export default async function organizationinfo(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];

    console.log(`${colours.fg.green}API: organizationinfo function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'`);

    try {
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const key = await org.checkKey(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${key.roles}'${colours.reset}`);
//        if (!Organization.checkRoles(roles, "administrator")) throw new PlutchikError("forbidden:rolerequiered", `administrator role was expected`);
        const userscount = await mongoUsers.aggregate([
            {
                '$match': {
                    'organizationid': org.json?._id,
                    'blocked': false
                }
            }, {
                '$count': 'count'
            }
        ]);

        const contentcount = await mongoContent.aggregate([
            {
                '$match': {
                    'organizationid': org.json?._id,
                    'blocked': false
                }
            }, {
                '$count': 'count'
            }
        ]);

        const assessmentscount = await mongoAssessments.aggregate([
            {
                '$match': {
                    'organizationid': org.json?._id,
                }
            }, {
                '$count': 'count'
            }
        ]);

        const ret = {
            name: org.json?.name,
            keyname: key.keyname,
            keyroles: key.roles,
            keyscount: org.json?.keys.length,
            userscount: userscount[0]?userscount[0].count:0,
            contentcount: contentcount[0]?contentcount[0].count:0,
            assessmentscount: assessmentscount[0]?assessmentscount[0].count:0
        };
        return res.status(200).json(ret);
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}