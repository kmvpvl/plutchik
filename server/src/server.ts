import OpenAPIBackend, { Context, Document, UnknownParams } from 'openapi-backend';
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from 'cors';
import version from './api/version';
import { tggetsessiontoken, tgcreateauthcode } from './api/auth';
import telegram, { webapp } from './api/telegram';
import TelegramBot from 'node-telegram-bot-api';
import checkSettings from './model/settings'; 
import fs from 'fs';
import path from 'path';
import User from './model/user';
import userinfo, {ogranizationAttachedToUser} from './api/user';
import createorganization from './api/organization';
import { Md5 } from 'ts-md5';
import { Types } from 'mongoose';
import getorgcontent, { addcontent, getcontentstatistics } from './api/content';
import addassessment from './api/addassessment';
import getnextcontentitem from './api/getnextcontentitem';

const PORT = process.env.PORT || 8000;
checkSettings();

async function notFound(c: any, req: Request, res: Response){
    const p = path.join(__dirname, '..', 'public', req.originalUrl);
    if (fs.existsSync(p)) {
        return res.sendFile(p);
    }
    return res.status(404).json('Not found');
}

const api = new OpenAPIBackend({ 
    definition: 'plutchikAPI.yml'
});
api.init();
api.register({
    version: version,
    tggetsessiontoken: async (c, req, res, user) => tggetsessiontoken(c, req, res, user),
    createorganization: async (c, req, res, user) => createorganization(c, req, res, user),
    tgcreateauthcode: async (c, req, res, user) => tgcreateauthcode(c, req, res, user, bot),
    userinfo: async (c, req, res, user) => userinfo(c, req, res, user),
    orgsattachedtouser: async (c, req, res, user) => ogranizationAttachedToUser(c, req, res, user),
    getorgcontent: async (c, req, res, user) => getorgcontent(c, req, res, user),
    addcontent: async (c, req, res, user) => addcontent(c, req, res, user),
    addassessment: async (c, req, res, user) => addassessment(c, req, res, user),
    getnextcontentitem: async (c, req, res, user) => getnextcontentitem(c, req, res, user),
    getcontentstatistics: async (c, req, res, user) => getcontentstatistics(c, req, res, user),

    telegram: async (c, req, res, user) => telegram(c, req, res, bot),
    tgwebapp: async (c, req, res, user) => webapp(c, req, res, bot),
    validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
    notFound: (c, req, res) => notFound(c, req, res),
    notImplemented: (c, req, res) => res.status(500).json({ err: 'not implemented' }),
    unauthorizedHandler: (c, req, res) => res.status(401).json({ err: 'not auth' })
});
api.registerSecurityHandler('PlutchikTGUserId',  async (context, req, res, user: User)=>{
    return user !== undefined;
});
api.registerSecurityHandler('PlutchikAuthSessionToken', async (context, req: Request, res, user: User)=>{
    const ssessiontoken = req.headers["plutchik_sessiontoken"];
    if (!ssessiontoken) return false;
    const cur_st = await user.checkSessionToken(new Types.ObjectId(ssessiontoken as string));
    return cur_st.equals(ssessiontoken as string);
});
api.registerSecurityHandler('PlutchikAuthCode', async (context, req: Request, res, user: User)=>{
    const sauthcode = req.headers["plutchik_authcode"];
    const hash = Md5.hashStr(`${user.uid} ${sauthcode}`);
    return hash === user.json?.auth_code_hash;
return true;    
});

api.registerSecurityHandler('PlutchikUserId', async (context, req: Request, res, user: User)=>{
    const plutchik_userid = req.headers["plutchik_userid"];
    return user.uid.equals(plutchik_userid as string);
return true;    
});


export const app: Application = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

const bot = new TelegramBot(process.env.tg_bot_authtoken as string);
if (process.env.tg_web_hook_server) {
    bot.setWebHook(`${process.env.tg_web_hook_server}/telegram`);
};

// use as express middleware
app.use(async (req: Request, res: Response) => {
    const stguid = req.headers["plutchik_tguid"];
    const sauthcode = req.headers["plutchik_authcode"];
    const ssessiontoken = req.headers["plutchik_sessiontoken"];

    console.log(`🔥 tguid='${stguid}'; authcode='${sauthcode}'; sessiontoken='${ssessiontoken}'`);
    
    const user = await User.getUserByTgUserId(parseInt(stguid as string));

    try {
        return await api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query as {[key: string]: string},
            headers: req.headers as {[key: string]: string}
        }, 
        req, res, user);
    } catch (e){
        return res.status(500).json({code: "Wrong parameters", description: `Request ${req.url}- ${(e as Error).message}`});
    }
});

export const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
