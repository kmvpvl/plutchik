import OpenAPIBackend, { Context, Document, UnknownParams } from 'openapi-backend';
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from 'cors';
import version from './api/version';
import { tggetsessiontoken, tgcreateauthcode } from './api/auth';
import telegram from './api/telegram';
import TelegramBot from 'node-telegram-bot-api';
import checkSettings from './model/settings'; 
import fs from 'fs';
import path from 'path';
import User from './model/user';
import userinfo, {getinsights, getmatchlist, informuserbytg, ogranizationAttachedToUser, reviewemotionaboveothers} from './api/user';
import {createorganization, getusersassessedorganizationcontent} from './api/organization';
import { Md5 } from 'ts-md5';
import { Types } from 'mongoose';
import getorgcontent, { addcontent, getcontentstatistics } from './api/content';
import addassessment from './api/addassessment';
import getnextcontentitem from './api/getnextcontentitem';
import { createHash, createHmac } from 'crypto';
import colours from './model/colours';
import Telegram from './model/telegram';
import ML from './model/mlstring';

const PORT = process.env.PORT || 8000;
checkSettings();

async function notFound(c: any, req: Request, res: Response){
    const p = path.join(__dirname, '..', 'public', req.originalUrl);
    if (fs.existsSync(p)) {
        return res.sendFile(p);
    }
    return res.status(404).json('Not found');
}

async function headAnswer (c: any, req: Request, res: Response) {
    return res.status(200).json();
}
const bot = new TelegramBot(process.env.tg_bot_authtoken as string);
const myBot = new Telegram(process.env.tg_bot_authtoken as string);
if (process.env.tg_web_hook_server) {
    bot.setWebHook(`${process.env.tg_web_hook_server}/telegram`)
        .catch(reason=>console.log(`${colours.fg.red}Setting TG webhook error '${JSON.stringify(reason)}'${colours.reset}`))
        .then(()=>{
            console.log(`${colours.fg.green}TG web hook created successfully${colours.reset}`);
            //bot info
            myBot.setMyName(process.env.tg_bot_name)
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyName error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyName successful '${JSON.stringify(ret)}'${colours.reset}`));
            
        
            myBot.setMyShortDescription(ML('Match mind first'))
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription for all langs error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription for all langs successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyShortDescription(ML('Match mind first', 'de'), 'de')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription de error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription de successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyShortDescription(ML('Match mind first', 'fr'), 'fr')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription fr error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription fr successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyShortDescription(ML('Match mind first', 'es'), 'es')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription fr error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription fr successful '${JSON.stringify(ret)}'${colours.reset}`));

            myBot.setMyShortDescription(ML('Match mind first', 'uk'), 'uk')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription uk error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription uk successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyShortDescription(ML('Match mind first', 'ru'), 'ru')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription ru error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription ru successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyShortDescription(ML('Match mind first', 'it'), 'it')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyShortDescription it error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyShortDescription it successful '${JSON.stringify(ret)}'${colours.reset}`));


            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`))
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription for all langs error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription for all langs successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'de'), 'de')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription de error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription de successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'fr'), 'fr')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription fr error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription fr successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'es'), 'es')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription fr error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription fr successful '${JSON.stringify(ret)}'${colours.reset}`));

            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'uk'), 'uk')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription uk error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription uk successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'ru'), 'ru')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription ru error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription ru successful '${JSON.stringify(ret)}'${colours.reset}`));
        
            myBot.setMyDescription(ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, 'it'), 'it')
            .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyDescription it error '${JSON.stringify(reason)}'${colours.reset}`))
            .then(ret=>console.log(`${colours.fg.green}Setting TG setMyDescription it successful '${JSON.stringify(ret)}'${colours.reset}`));

            //bot menu
            bot.setChatMenuButton({menu_button: {type: "commands"}}).then(res=>{
                console.log(`${colours.fg.green}TG SetChatMenuButton return '${res}' ${colours.reset}`);
                bot.setMyCommands([{command: "start", description: "Register me"},
                    {command: "home", description: "Main menu"}, 
                    {command: "help", description: "I have an issue, pls help me"}])
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand en successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Registriere mich"}, 
                    {command: "home", description: "Hauptmenü"}, 
                    {command: "help", description: "Ich habe ein Problem, bitte helfen Sie mir"}], {language_code:"de"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand de successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Зарегистрируйте меня"}, 
                    {command: "home", description: "Главное меню"}, 
                    {command: "help", description: "Мне нужна помощь, помогите мне, пожалуста"}], {language_code:"ru"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand ru successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Registrame"}, 
                    {command: "home", description: "Menú principal"}, 
                    {command: "help", description: "Tengo un problema por favor ayúdenme."}], {language_code:"es"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand es successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Inscrivez-moi"}, 
                    {command: "home", description: "Menu principal"}, 
                    {command: "help", description: "J'ai un problème, aidez-moi s'il vous plaît"}], {language_code:"fr"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand fr successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Зарегистрируйте меня"}, 
                    {command: "home", description: "Головне меню"}, 
                    {command: "help", description: "У мене проблема, будь ласка, допоможіть мені"}], {language_code:"uk"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand uk successful '${JSON.stringify(ret)}'${colours.reset}`));
                bot.setMyCommands([{command: "start", description: "Registrami"}, 
                    {command: "home", description: "Menu principale"}, 
                    {command: "help", description: "Ho un problema, per favore aiutami"}], {language_code:"it"})
                    .catch(reason=>console.log(`${colours.fg.red}Setting TG setMyCommand error '${JSON.stringify(reason)}'${colours.reset}`))
                    .then(ret=>console.log(`${colours.fg.green}Setting TG setMyCommand it successful '${JSON.stringify(ret)}'${colours.reset}`));
            })
            .catch(reason=>console.log(`${colours.fg.red}Setting TG SetChatMenuButton error '${JSON.stringify(reason)}'${colours.reset}`));
    });
};

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
    getinsights: async (c, req, res, user) => getinsights(c, req, res, user),
    reviewemotionaboveothers: async (c, req, res, user) => reviewemotionaboveothers(c, req, res, user),
    getmatchlist: async (c, req, res, user) => getmatchlist(c, req, res, user),
    getusersassessedorganizationcontent: async (c, req, res, user) => getusersassessedorganizationcontent(c, req, res, user),
    informuserbytg: async (c, req, res, user) => informuserbytg(c, req, res, user, bot),

    telegram: async (c, req, res, user) => telegram(c, req, res, bot),

    headAnswer: async (c, req, res) => headAnswer(c, req, res),
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
});

api.registerSecurityHandler('TGQueryCheckString', async (context, req: Request, res, user: User)=>{
    try {
        const plutchik_tgquerycheckstring = decodeURIComponent(req.headers["plutchik_tgquerycheckstring"] as string);
        const arr = plutchik_tgquerycheckstring.split('&');
        const hashIndex = arr.findIndex(str => str.startsWith('hash='));
        const hash = arr.splice(hashIndex)[0].split('=')[1];

        const secret_key = createHmac('sha256', "WebAppData").update(process.env.tg_bot_authtoken as string).digest();
        arr.sort((a, b) => a.localeCompare(b));

        const check_hash = createHmac('sha256', secret_key).update(arr.join('\n')).digest('hex');
        return check_hash === hash;
    } catch (e) {
        return false;
    }
});


export const app: Application = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

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
