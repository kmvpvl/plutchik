import { Request, Response } from 'express';
import colours from '../model/colours';
import User from "../model/user";

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
