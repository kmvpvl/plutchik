import { Request, Response } from 'express';
import colours from '../model/colours';
import User from "../model/user";
import Organization from '../model/organization';
import TelegramBot from 'node-telegram-bot-api';
import { Types } from 'mongoose';
import PlutchikError from '../model/error';
import { mainKeyBoardMenu } from './telegram';
import ML from '../model/mlstring';

export default async function userinfo(c: any, req: Request, res: Response, user: User) {
    return res.status(200).json(user.json);
}

export async function ogranizationAttachedToUser(c: any, req: Request, res: Response, user: User){
    const orgs = await user.getOrganizationsUserAttachedTo();
    return res.status(200).json(orgs);
}

export async function getinsights(c: any, req: Request, res: Response, user: User){
    const ob = await user.observeAssessments();
    return res.status(200).json({observe: ob, user: user.json});
}

export async function reviewemotionaboveothers(c: any, req: Request, res: Response, user: User){
    const em = req.body.emotion;
    const invitationid = req.body.invitationid !== undefined?new Types.ObjectId(req.body.invitationid):undefined;
    console.log(`${colours.fg.blue}Values: emotion = '${em}', invitationid = '${invitationid}'${colours.reset}`);
    if (invitationid !== undefined){
        const org = await Organization.getOrganizationByInvitationId(invitationid);
        if (!org.checkRoles(user, "manage_users")) return res.status(403).json('User has no role "manage_users"');
        const una = await org.getUserAndAssignByInvitationId(invitationid);
        const ob = await una.user.reviewByEmotion(em, una.assign?._id);
        return res.status(200).json({decoding: ob, user: user.json});
    } else {
        const ob = await user.reviewByEmotion(em);
        return res.status(200).json({decoding: ob, user: user.json});
    }
}

export async function getmatchlist(c: any, req: Request, res: Response, user: User){
    const u = await user.getMatchList();
    return res.status(200).json({matchlist: u, user: user.json});
}

export async function reminduseraboutinvitation(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const m = req.body.message;
    const invitationid = new Types.ObjectId(req.body.invitationid);
    console.log(`${colours.fg.blue}Args: message = '${m}'; invitationid = '${invitationid}'${colours.reset}`);
    try {
        const org = await Organization.getOrganizationByInvitationId(invitationid);
        if (!org.checkRoles(user, "manage_users")) return res.status(403).json('User has no role "manage_users"');
        const arrInv = org.json?.invitations?.filter(i=>invitationid.equals(i._id));
        if (arrInv) {
            const user_n_assign = await org.getUserAndAssignByInvitationId(invitationid);
            const assign = user_n_assign.assign;
            const sutableTime = await user_n_assign.user.getSutableTimeToChat();
            if (assign !== undefined && !assign.closed){
                bot.sendMessage(arrInv[0].whom_tguserid, `${user.json?.name} ${ML("reminds you about the set", user_n_assign.user.json?.nativelanguage)} '${org.json?.name}'`, {reply_markup: {inline_keyboard:mainKeyBoardMenu(user?.json?.nativelanguage)}});
            } else {
                return res.status(404).json({ok: false, 
                    message: assign===undefined?
                    ML("User didn't accept your invitation", user.json?.nativelanguage):
                    ML(`The assign was closed`, user.json?.nativelanguage)});
            }
            return res.status(200).json(sutableTime);
        } else {
            throw new PlutchikError("organization:broken", `Couldn't find invitation = '${invitationid}'`);
        }
    } catch(e: any) {
        return res.status(404).json({ok: "FAIL", message: `invitationid = '${invitationid}' not found`});
    }
}
