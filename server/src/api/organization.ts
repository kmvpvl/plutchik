import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { IOrganization } from '../model/organization';
import User from '../model/user';

export default async function createorganization(c: any, req: Request, res: Response, user: User) {
    const name = req.body.name;
    const emails = req.body.emails;

    console.log(`${colours.fg.green}API: createorganization function${colours.reset}\n ${colours.fg.blue}Parameters: name = '${name}'; emails = '${emails}'${colours.reset}`);

    try {
        const org: IOrganization = {
            name: name,
            emails: emails,
            participants: [{
                uid: user.uid,
                created: new Date(),
                roles: ["administrator"]
            }],
            created: new Date()
        };
        const o = new Organization(undefined, org);
        await o.save();
        return res.status(200).json(o.json);
    } catch (e: any) {
        return res.status(400).json(e.message);
    }
}