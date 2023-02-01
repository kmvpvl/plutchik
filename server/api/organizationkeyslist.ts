import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { IKey } from '../model/organization';

export default async function organizationkeyslist(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];

    console.log(`${colours.fg.green}API: organizationkeyslist function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'`);

    try {
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);
        if (!Organization.checkRoles(roles, "administrator")) throw new PlutchikError("forbidden:rolerequiered", `administrator role was expected`);
        const ret = new Array();
        if (org.json)
            for (const [i, k] of Object.entries(org.json.keys)) {
                ret.push({
                    id: i,
                    keyname: k.keyname,
                    created: k.created,
                    roles: k.roles,
                    expired: k.expired
                });
            }
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