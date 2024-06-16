import { Request, Response } from 'express';
import { Types } from 'mongoose';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import Organization, { IInvitationToAssess, IOrganization } from '../model/organization';
import User from '../model/user';
import TelegramBot from 'node-telegram-bot-api';
import ML from '../model/mlstring';
import { mongoAssessments } from '../model/assessment';

export async function createorganization(c: any, req: Request, res: Response, user: User) {
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

export async function getusersassessedorganizationcontent(c: any, req: Request, res: Response, user: User) {
    const oid = new Types.ObjectId(req.body.oid);
    console.log(`${colours.fg.green}API: getusersassessedorganizationcontent function${colours.reset}\n ${colours.fg.blue}Parameters: oid = '${oid}'${colours.reset}`);
    try {
        const org = new Organization(oid);
        await org.load();
        if (!await org.checkRoles(user, "manage_users")) return res.status(403).json({err: 403, desc: `Role manage_users requires`});;
        const users = await org.getUsersAssessedContent();
        return res.status(200).json(users);
    } catch (e: any) {
        return res.status(400).json(e.message);
    }
}

export async function renameorganization(c: any, req: Request, res: Response, user: User) {
    const newname = req.body.newname;
    const oid = new Types.ObjectId(req.body.oid);
    console.log(`${colours.fg.green}API: renameorganization function${colours.reset}\n ${colours.fg.blue}Parameters: newname = '${newname}'${colours.reset}; oid = '${oid}'`);
    try {
        const org = new Organization(oid);
        await org.load();
        if (!await org.checkRoles(user, "administrator")) return res.status(403).json({err: 403, desc: `Role administrator requires`});;
        await org.rename(newname);
        return res.status(200).json(org.json);
    } catch (e: any) {
        return res.status(400).json(e.message);
    }
}
export async function getinvitationstats(c: any, req: Request, res: Response, user: User, bot: TelegramBot) {
    const inv_id = new Types.ObjectId(req.body.invitation_id);
    const oid = new Types.ObjectId(req.body.oid);
    console.log(`${colours.fg.green}API: getinvitationstats function${colours.reset}\n ${colours.fg.blue}Parameters: inv_id = '${inv_id}'${colours.reset}; oid = '${oid}'`);
    const ret: any = {};
    try {
        const org = new Organization(oid);
        await org.load();
        if (!await org.checkRoles(user, "assessment_request")) return res.status(403).json({err: 403, desc: `Role assessment_request requires`});
        ret.contentcount = await org.getContentItemsCount();
        const user_n_assign = await org.getUserAndAssignByInvitationId(inv_id);
        const assign = user_n_assign.assign;
        if (assign !== undefined) {
            ret.assigned = true;
            ret.assigndate = assign.assigndate;
            ret.closed = assign.closed;
            ret.closedate = assign.closedate;
            const acount = await mongoAssessments.aggregate([
                {"$match": {"assignid": assign._id}
                }, {"$count": "count"}
            ]);
            ret.contentassessed = acount === undefined || acount.length === 0?0:acount[0].count;
            // if user has role to manage users only. Have to return assessments compare
            if (await org.checkRoles(user, "manage_users") && user_n_assign.assign !== undefined) {
                const observe = await user_n_assign.user.observeAssessments(assign._id);
                ret.observe = observe;
            }
        } else {
            ret.assigned = false;
        }
        return res.status(200).json(ret);
    } catch (e: any) {
        return res.status(400).json(e.message);
    }
}
export async function requesttoassignorgtouser(c: any, req: Request, res: Response, user: User, bot: TelegramBot) {
    const oid = new Types.ObjectId(req.body.oid);
    const tguserid: TelegramBot.ChatId = req.body.tguserid;
    console.log(`${colours.fg.green}API: requesttoassignorgtouser function${colours.reset}\n ${colours.fg.blue}Parameters: oid = '${oid}'; tguserid = '${tguserid}'${colours.reset}`);
    try {
        const org = new Organization(oid);
        await org.load();
        if (!await org.checkRoles(user, "assessment_request")) return res.status(403).json({err: 403, desc: `Role assessment_request requires`});

        const invitation_id = new Types.ObjectId();
        const message = await bot.sendMessage(tguserid, `${ML(`User`)} ${user.json?.name} invites your assessing set '${org.json?.name}'.\n${ML('Click the "I Accept" button to express your informed consent that the author of the request will be able to familiarize yourself with your emotional assessments of the proposed content')}\n${ML(`Click the "I Decline" button to reject and cancel the request. The requester will be informed that their request has been rejected`)}`, {reply_markup:{inline_keyboard:[
            [{text: ML(`I accept`), callback_data: `accept_org:${invitation_id}`}],
            [{text: ML(`I decline`), callback_data: `decline_org:${invitation_id}`}]
/* fixed main menu issue and those buttons are redundant            [{text: ML(`I accept`), callback_data: `accept_assignment_org:${org.uid}:${user.uid}`}],
            [{text: ML(`I decline`), callback_data: `decline_assignment_org:${org.uid}:${user.uid}`}]
 */        ]}});
        const invitation: IInvitationToAssess = {
            _id: invitation_id,
            messageToUser: message,
            from_tguserid: user.json?.tguserid as number,
            whom_tguserid: tguserid,
            closed: false
        }

        await org.logInvitation(invitation);

        return res.status(200).json(org.json);
    } catch (e: any) {
        return res.status(400).json(e.message);
    }
}