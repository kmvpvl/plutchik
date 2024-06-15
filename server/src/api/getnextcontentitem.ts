import { Types } from "mongoose";
import Organization from "../model/organization";
import User from "../model/user";
import { Request, Response } from 'express';
import colours from "../model/colours";
import TelegramBot from "node-telegram-bot-api";

export default async function getnextcontentitem(c: any, req: Request, res: Response, user: User, bot: TelegramBot){
    console.log(`${colours.fg.green}API: getnextcontentitem function${colours.reset}`);
    try {
        const ci = await user.nextContentItem(bot, user.json?.nativelanguage);
        return res.status(200).json({
            contentitem: ci,
            user: user.json
        });
    } catch (err: any) {
        return res.status(404).json({result: 'FAIL', description: 'Could not get next content item', user: user.json});
    }
}