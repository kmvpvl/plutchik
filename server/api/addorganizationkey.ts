import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization from '../model/organization';

export default async function adduser(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const key_name = req.body.name;
    const key_roles = req.body.roles;

    console.log(`${colours.fg.green}API: addorganizationkey function${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; name = '${key_name}'; roles = '${key_roles}'`);

    try {
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        if (!Organization.checkRoles(roles, "administrator")) throw new PlutchikError("forbidden:rolerequiered", `administrator role was expected`);
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);
        const oNK = await org.addKey(key_name, key_roles);
        return res.status(200).json(oNK.toString());
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}