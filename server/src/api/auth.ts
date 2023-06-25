import { Request, Response } from 'express';
import colours from '../model/colours';
import PlutchikError, { ErrorCode } from '../model/error';
import User from '../model/user';
import { Md5 } from 'ts-md5';
import TelegramBot from 'node-telegram-bot-api';

export async function tggetsessiontoken(c: any, req: Request, res: Response, user: User) {
    console.log(`${colours.fg.green}API: tggetsessiontoken function.${colours.reset}`);
    try {
        return res.status(200).json(await user.checkSessionToken());
    } catch (e: any) {
        switch (e.code as ErrorCode) {
            case "forbidden:rolerequiered":
                return res.status(401).json(e);
            default:
            return res.status(400).json(e);
        }
    }
}

export async function tgcreateauthcode(c: any, req: Request, res: Response, user: User, bot: TelegramBot) {
    const ac = await user.createAuthCode();
    if (ac) bot.sendMessage(user.json?.tguserid as number, ac);
    return res.status(200).json({desc: 'Auth code sent by Telegram'});
}
