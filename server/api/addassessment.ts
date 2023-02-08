import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Assessment from '../model/assessment';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { SessionTokenSchema } from '../model/organization';
import User from '../model/user';
export default async function addassessment(c: any, req: Request, res: Response) {
    const userid = req.headers["userid"];
    const sessiontoken = req.headers["sessiontoken"];
    console.log(`${colours.fg.green}API: addassessment function${colours.reset}\n ${colours.fg.blue}Parameters: userid = '${userid}'; sessiontoken = '${sessiontoken}'${colours.reset}`);
    console.log(`${colours.fg.blue}assessmentinfo = '${JSON.stringify(req.body.assessmentinfo)}'${colours.reset}`);
    try{
        // load user object
        const user = new User(new Types.ObjectId(userid as string));
        await user.load();

        //checking active session and get roles
        const checkST = await user.checkSesstionToken(new Types.ObjectId(sessiontoken as string));
        console.log(`Checking session token successful. Roles = ${colours.fg.blue}${checkST}${colours.reset}`);
        if (!Organization.checkRoles(checkST, "create_assessment")) throw new PlutchikError("forbidden:rolerequiered", `create_assessment role was expected`);
        
        req.body.assessmentinfo.organizationid = user.json?._id;
        //filling optional fields
        req.body.assessmentinfo.uid = new Types.ObjectId(userid as string);
        req.body.assessmentinfo.created = new Date();
        // creating Assessment object for saving
        const a = new Assessment(undefined, req.body.assessmentinfo);
        await a.save();
        return res.status(200).json(a.json);
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}
