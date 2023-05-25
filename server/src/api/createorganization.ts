import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { IOrganization } from '../model/organization';

export default async function createorganization(c: any, req: Request, res: Response) {
    // const organizationid = req.headers["organizationid"];
    // const organizationkey = req.headers["organizationkey"];
    const name = req.body.name;
    const emails = req.body.emails;

    console.log(`${colours.fg.green}API: createorganization function${colours.reset}\n ${colours.fg.blue}Parameters: name = '${name}'; roles = '${emails}'`);

    try {
        const orgData: IOrganization = {
            name: name,
            keys: [],
            emails: emails,
            created: new Date(),
            changed: new Date()
        };
        const org = new Organization(undefined, orgData);
        await org.save();
        const oNK = await org.addKey("Administrator", ["administrator"]);
        return res.status(200).json({
            organizationid: org.json?._id,
            organizationkey: oNK.toString()
        });
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}