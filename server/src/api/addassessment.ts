import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Assessment from '../model/assessment';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { SessionTokenSchema } from '../model/organization';
import User from '../model/user';
export default async function addassessment(c: any, req: Request, res: Response, user: User) {
    const userid = req.headers["userid"];
    console.log(`${colours.fg.green}API: addassessment function${colours.reset}\n ${colours.fg.blue}Parameters: userid = '${userid}'${colours.reset}`);
    console.log(`${colours.fg.blue}assessmentinfo = '${JSON.stringify(req.body.assessmentinfo)}'${colours.reset}`);
    try{
        // load user object
        if (!user.uid.equals(userid as string)) throw new PlutchikError("user:notfound", `Not the same tguid and _id`);
        
        //filling optional fields
        req.body.assessmentinfo.uid = user.uid;
        req.body.assessmentinfo.created = new Date();
        // creating Assessment object for saving
        const a = new Assessment(undefined, req.body.assessmentinfo);
        await a.save();
        return res.status(200).json(a.json);
    } catch (e: any) {
        return res.status(400).json(e);
    }
}
