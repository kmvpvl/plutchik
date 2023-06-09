import OpenAPIBackend from 'openapi-backend';
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from 'cors';
import version from './api/version';
import adduser from './api/adduser';
import getsessiontoken from './api/getsessiontoken';
import blockuser from './api/blockuser';
import addcontent from './api/addcontent';
import blockcontent from './api/blockcontent';
import addassessment from './api/addassessment';
import addorganizationkey from './api/addorganizationkey';
import organizationkeyslist from './api/organizationkeyslist';
import removeorganizationkey from './api/removeorganizationkey';
import createorganization from './api/createorganization';
import organizationinfo from './api/organizationinfo';
import telegram, { webapp } from './api/telegram';
import TelegramBot from 'node-telegram-bot-api';
import checkSettings from './model/settings'; 
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 8000;
checkSettings();

function checkSecurity(c: any): boolean {
    try{
        //const user = new User(c.request);
        return true; 
    } catch(e){
        return false;
    }
}

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
    version:    async (c, req, res) => version(c, req, res),
    createorganization: async (c, req, res) => createorganization(c, req, res),
    getsessiontoken:    async (c, req, res) => getsessiontoken(c, req, res),
    adduser:    async (c, req, res) => adduser(c, req, res),
    addorganizationkey:    async (c, req, res) => addorganizationkey(c, req, res),
    organizationkeyslist:    async (c, req, res) => organizationkeyslist(c, req, res),
    removeorganizationkey: async (c, req, res) => removeorganizationkey(c, req, res),
    organizationinfo:    async (c, req, res) => organizationinfo(c, req, res),
    blockuser:    async (c, req, res) => blockuser(c, req, res),
    unblockuser:    async (c, req, res) => blockuser(c, req, res, false),
    addcontent:    async (c, req, res) => addcontent(c, req, res),
    blockcontent:    async (c, req, res) => blockcontent(c, req, res),
    unblockcontent:    async (c, req, res) => blockcontent(c, req, res, false),
    addassessment:    async (c, req, res) => addassessment(c, req, res),
    telegram: async (c, req, res) => telegram(c, req, res, bot),
    tgwebapp: async (c, req, res) => webapp(c, req, res, bot),
    validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
    notFound: (c, req, res) => notFound(c, req, res),
    notImplemented: (c, req, res) => res.status(500).json({ err: 'not implemented' }),
    unauthorizedHandler: (c, req, res) => res.status(401).json({ err: 'not auth' })
});
api.registerSecurityHandler('PlutchikAuthOrganizationId',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthOrganizationKey',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthUserId',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthSessionToken',  checkSecurity);


export const app: Application = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

const bot = new TelegramBot(process.env.tg_bot_authtoken as string);
if (process.env.tg_web_hook_server) {
    bot.setWebHook(`${process.env.tg_web_hook_server}/telegram`);
    /*bot.setMyCommands([
        {command: '/start', description:'Start', },
        {command: '/set_language', description:'Set language', },
    ], {language_code: 'en'});
    bot.setMyCommands([
        {command: '/start', description:'Comenzar', },
        {command: '/set_language', description:'Elegir lenguaje', },
    ], {language_code: 'es'});
    bot.setMyCommands([
        {command: '/start', description:'Start', },
        {command: '/set_language', description:'Sprache einstellen', },
    ], {language_code: 'de'});
    bot.setMyCommands([
        {command: '/start', description:'Почати', },
        {command: '/set_language', description:'Встановити мову', },
    ], {language_code: 'uk'});
    bot.setMyCommands([
        {command: '/start', description:'Начать', },
        {command: '/set_language', description:'Установить язык', },
    ], {language_code: 'ru'});*/
};

// use as express middleware
app.use(async (req: Request, res: Response) => {
    try {
        return await api.handleRequest({
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query as {[key: string]: string},
        headers: req.headers as {[key: string]: string}
        }, 
        req, res);
    } catch (e){
        return res.status(500).json({code: "Wrong parameters", description: `Request ${req.url}- ${(e as Error).message}`});
    }
});

export const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});