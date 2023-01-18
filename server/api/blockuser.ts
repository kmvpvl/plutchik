import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError from '../model/error';
import Organization from '../model/organization';
import User from '../model/user';
//import User from "../model/user";

export default async function blockuser(c: any, req: Request, res: Response, block = true) {
    const organizationid = req.headers["organizationid"];
    const organizationkey = req.headers["organizationkey"];
    const userid = req.headers["userid"];
    console.log(`${colours.fg.green}API: blockuser function.${colours.reset}\n ${colours.fg.blue}Parameters: organizationid = '${organizationid}'; organizationkey = '${organizationkey}'; userid = ${userid}; block = '${block}'${colours.reset}`);
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
        user.block(block);
        await user.save();
        // looking for existing session
        return res.status(200).json();
    } catch (e: any) {
        return res.status(404).json(e);
    }
}