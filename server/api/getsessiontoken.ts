import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';
//import User from "../model/user";

export default async function getsessiontoken(c: any, req: Request, res: Response) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    console.log(`${colours.fg.green}API: getsessiontoken function.${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}${colours.reset}`);
    try {
        // Loading  organization data
        const org = new Organization(new Types.ObjectId(organizationid as string));
        await org.load();
        // Checking organization key
        const roles = await org.checkKeyAndGetRoles(new Types.ObjectId(organizationkey as string));
        console.log(`${colours.fg.blue}roles = '${roles}'${colours.reset}`);
        // Checking user id
        const oUserid = new Types.ObjectId(userid as string);
        const user = new User(oUserid);
        await user.load();

        // looking for existing session
        return res.status(200).json(await org.checkAndUpdateSessionToken(oUserid, roles));
    } catch (e: any) {
        return res.status(404).json(e);
    }
}