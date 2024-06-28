import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Assessment from '../model/assessment';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { SessionTokenSchema } from '../model/organization';
import User from '../model/user';
export default async function addassessment(c: any, req: Request, res: Response, user: User) {
    console.log(`${colours.fg.green}API: addassessment function${colours.reset}\n ${colours.fg.blue}Parameters: ${colours.reset}`);
    console.log(`${colours.fg.blue}assessmentinfo = '${JSON.stringify(req.body.assessmentinfo)}'${colours.reset}`);
    try{
        //filling optional fields
        req.body.assessmentinfo.uid = user.uid;
        req.body.assessmentinfo.created = new Date();
        // creating Assessment object for saving
        const a = new Assessment(undefined, req.body.assessmentinfo);
        await a.save();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        await user.noticeIP(ip);
        return res.status(200).json(a.json);
    } catch (e: any) {
        return res.status(400).json(e);
    }
}
