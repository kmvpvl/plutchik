import { Request, Response } from 'express';
import colours from '../model/colours';
import User from "../model/user";
import Organization from '../model/organization';
import TelegramBot from 'node-telegram-bot-api';
import { Types } from 'mongoose';

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
    const ob = await user.reviewByEmotion(em);
    return res.status(200).json({decoding: ob, user: user.json});
}

export async function getmatchlist(c: any, req: Request, res: Response, user: User){
    const u = await user.getMatchList();
    return res.status(200).json({matchlist: u, user: user.json});
}

export async function informuserbytg(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    const m = req.body.message;
    const tguserid = req.body.tguserid;
    const organizationid = new Types.ObjectId(req.body.organizationid);
    const org = new Organization(organizationid);
    await org.load();
    if (!org.checkRoles(user, "manage_users")) return res.status(403).json('User has no role "manage_users"');
    const u = await User.getUserByTgUserId(tguserid);
    if (u === undefined) return res.status(404).json('User not found')
    const d = await u.getSutableTimeToChat();
    bot.sendMessage(tguserid, m, {disable_notification: true});
    return res.status(200).json(d);
}
