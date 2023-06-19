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
