import { Request, Response } from 'express';
import PlutchikError, { ErrorCode } from '../model/error';
import colours from "../model/colours";
import TelegramBot from 'node-telegram-bot-api';
import Organization, { IOrganization, mongoOrgs } from '../model/organization';
import PlutchikProto, { settings } from '../model/plutchikproto';
import Content, { IContent, mongoContent } from '../model/content';
import User, { mongoUsers } from '../model/user';
import { google } from 'googleapis';
import { Types } from 'mongoose';

const assess_new_content: Map<string, string> = new Map([
    ['en', 'Assess new content']
    ,['uk', 'Оцінити емоції']
    ,['ru', 'Оценить ещё']
    ,['es', 'Evaluar emociones']
    ,['de', 'Emotionen bewerten']
]);

const my_settings: Map<string, string> = new Map([
    ['en', 'My settings']
    ,['uk', 'Мої налаштування']
    ,['ru', 'Мои настройки']
    ,['es', 'Mi configuración']
    ,['de', 'Meine Einstellungen']
]);

const set_language: Map<string, string> = new Map([
    ['en', 'Set language']
    ,['uk', 'Встановити мову']
    ,['ru', 'Установить язык']
    ,['es', 'Elegir lenguaje']
    ,['de', 'Sprache einstellen']
]);

const choose_language: Map<string, string> = new Map([
    ['en', 'Choose language']
    ,['uk', 'Виберіть мову']
    ,['ru', 'Выберите язык']
    ,['es', 'Elige lengua']
    ,['de', 'Sprache wählen']
]);

const language_changed: Map<string, string> = new Map([
    ['en', 'Language was changed']
    ,['uk', 'Мова змінена']
    ,['ru', 'Язык изменен']
    ,['es', 'Idioma cambiado']
    ,['de', 'Sprache geändert']
]);

function tg_bot_start_menu(lang: string):TelegramBot.SendMessageOptions {
    return  {
        reply_markup: {
            inline_keyboard:[
                [
                    {
                        text: assess_new_content.get(lang)?assess_new_content.get(lang) as string:assess_new_content.get('en') as string,
                        web_app: {
                            url: `${settings.tg_web_hook_server}/telegram`
                        }
                    }
                    ,{
                        text: my_settings.get(lang)?my_settings.get(lang) as string:my_settings.get('en') as string,
                        callback_data: 'settings'
                    }
                ]
            ]
        }
    }
};

function tg_bot_settings_menu(lang: string):TelegramBot.SendMessageOptions {
    return {
        reply_markup: {
            inline_keyboard:[
                [
                    {
                        text: set_language.get(lang)?set_language.get(lang) as string:set_language.get('en') as string,
                        callback_data: 'set_language'
                    }
                    /*,{
                        text: 'Set my location',
                        callback_data: 'set_location'
                    }*/
                ]
                ,[
                    {
                        text: my_settings.get(lang)?my_settings.get(lang) as string:my_settings.get('en') as string,
                        callback_data: 'settings'
                    }
                ]
            ]
        }
    }
};

const tg_bot_set_language_menu:TelegramBot.SendMessageOptions = {
    reply_markup: {
        inline_keyboard:[
            [
                {
                    text: 'English',
                    callback_data: 'set_language_en'
                }
                ,{
                    text: 'Español',
                    callback_data: 'set_language_es'
                }
                ,{
                    text: 'Deutsch',
                    callback_data: 'set_language_de'
                }
            ], [
                {
                    text: 'Українська',
                    callback_data: 'set_language_uk'
                }
                ,{
                    text: 'Русский',
                    callback_data: 'set_language_ru'
                }
            ]
            ,[
                {
                    text: 'My settings',
                    callback_data: 'settings'
                }
            ]
        ]
    }
};
export default async function telegram(c: any, req: Request, res: Response, bot: TelegramBot) {
    console.log(`${colours.fg.green}API: telegram function${colours.reset}`);
    const tgData: TelegramBot.Update = req.body;
    if (tgData.callback_query){
        try {
            const u = await getUserByTgUserId(tgData.callback_query.from.id as number);

            console.log(`Callback command '${tgData.callback_query.data}'`);
            switch(tgData.callback_query.data) {
                case 'settings':
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, my_settings.get(u?.json?.nativelanguage as string)?my_settings.get(u?.json?.nativelanguage as string) as string:my_settings.get('en') as string, tg_bot_settings_menu(u?.json?.nativelanguage as string));
                    break;
                case 'set_language':
                    menuSetLanguage(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                case 'set_language_en':
                case 'set_language_uk':
                case 'set_language_es':
                case 'set_language_ru':
                case 'set_language_de':
                    const lang = tgData.callback_query.data.split('_')[2];
                    console.log(`Changing user's language to '${lang}'`);
                    await u?.changeNativeLanguage(lang);
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, language_changed.get(lang)?language_changed.get(lang) as string:language_changed.get('en') as string, tg_bot_start_menu(u?.json?.nativelanguage as string));
                    break;
                default: bot.sendMessage(tgData.callback_query?.message?.chat.id as number, `Unknown callback command '${tgData.callback_query.data}'`, tg_bot_start_menu(u?.json?.nativelanguage as string));
            }
            return res.status(200).json("OK");
        } catch (e: any) {
            return res.status(400).json(e);
        }
    }
    console.log(`${colours.fg.blue}Telegram userId = '${tgData.message?.from?.id}'${colours.reset}; chat_id = '${tgData.message?.chat.id}'`);
    try{
        if (
            !await processCommands(bot, tgData) 
            && !await processURLs(bot, tgData)) {
                bot.sendMessage(tgData.message?.chat.id as number, `Sorry, i couldn't apply this content. Check spelling`);
            };
        
        return res.status(200).json("OK");
    } catch (e: any) {
        return res.status(400).json(e);
    }
}

export async function onPhoto(bot: TelegramBot, msg: TelegramBot.Message) {
    const ph = msg.photo?.pop();
    if (ph){
        const filename = await bot.downloadFile(ph.file_id, "./images/");
        bot.sendMessage(msg.chat.id, `downloaded ${filename}`);
    }
} 

export async function webapp(c: any, req: Request, res: Response, bot: TelegramBot) {
    console.log(`${colours.fg.green}API: telegram webapp${colours.reset}`);
    let user: User | undefined;
    try {
        if (req.query['command']) {
            switch(req.query['command']) {
                case 'getnext':
                    user = await getUserByTgUserId(parseInt(req.query['tg_user_id'] as string));
                    if (user) {
                        const org = new Organization(user.json?.organizationid);
                        await org.load();
                        const st = await org.checkAndUpdateSessionToken(user.json?._id as Types.ObjectId, ["create_assessment"]);
                        const ci = await user.nextContentItem(user.json?.nativelanguage);
                        return res.status(200).json({result: 'OK', content: ci, user:user.json, sessiontoken: st});
                    } else {
                        return res.status(404).json({result: 'FAIL', description: 'User not found'});
                    }
                    break;
                default:
                    return res.status(404).json({result: 'FAIL', description: 'Unknown command'});
            }
            return res.status(200).json('OK');
        } else 
            return res.sendFile("webapp.htm", {root: __dirname});
    } catch(e: any) {
        switch (e.code as ErrorCode) {
            case "user:nonextcontent":
                if (user) e.user = user.json;
                return res.status(404).json(e);
            default:
                return res.status(400).json(e);
        }
    }
}

async function getUserByTgUserId(tg_user_id: number): Promise<User | undefined> {
    PlutchikProto.connectMongo();
    const ou = await mongoUsers.aggregate([{
        '$match': {
            'tguserid': tg_user_id
        }
    }]);
    if (ou.length) return new User(undefined, ou[0]);
}

const tgWelcome: Map<string, string> = new Map([
    ['en', `Welcome! This bot helps evaluate you psycology sustainability  dynamically. Also it provides you finding people with similar mindset. We respect your privacy. Be sure that we'll delete all your data at any moment you request`]
    ,['uk', 'Ласкаво просимо! Цей бот допомагає динамічно оцінити вашу психологічну стійкість. Також це дозволяє вам знайти людей зі схожим мисленням. Ми поважаємо вашу конфіденційність. Будьте впевнені, що ми видалимо всі ваші дані у будь-який час на ваш запит']
    ,['ru', 'Добро пожаловать! Этот бот помогает динамически оценить вашу психологическую устойчивость. Также он позволяет вам найти людей со схожим мышлением. Мы уважаем вашу конфиденциальность. Будьте уверены, что мы удалим все ваши данные в любое время по вашему запросу']
    ,['es', '¡Bienvenido! Este bot te ayuda a evaluar dinámicamente tu resiliencia mental. También te permite encontrar personas con mentalidades similares. Respetamos tu privacidad. Tenga la seguridad de que eliminaremos todos sus datos en cualquier momento si lo solicita.']
    ,['de', 'Willkommen zurück! Dieser Bot hilft Ihnen, Ihre mentale Belastbarkeit dynamisch einzuschätzen. Es ermöglicht Ihnen auch, Menschen mit ähnlichen Denkweisen zu finden. Wir respektieren deine Privatsphäre. Seien Sie versichert, dass wir alle Ihre Daten jederzeit auf Ihren Wunsch löschen werden.']
]);

async function processCommands(bot: TelegramBot, tgData: TelegramBot.Update): Promise<boolean> {
    // looking for bot-command from user
    const commands = tgData.message?.entities?.filter(v => v.type == "bot_command");
    if (!commands || !(commands as any).length ) return false;
    console.log(`command(s) found: ${tgData.message?.text}`);
    for (let [i, c] of Object.entries(commands as Array<TelegramBot.MessageEntity>)) {
        const command_name = tgData.message?.text?.substring(c.offset, c.offset + c.length);
        console.log(`${colours.fg.green}Processing command = '${command_name}'${colours.reset}`);
        const u = await getUserByTgUserId(tgData.message?.from?.id as number);
        switch (command_name) {
            case '/start': 
                if (u){
                    bot.sendMessage(tgData.message?.chat.id as number, tgWelcome.get(u.json?.nativelanguage?u.json?.nativelanguage:'en') as string, tg_bot_start_menu(u.json?.nativelanguage as string));
                } else {
                    const user = new User(undefined, {
                        organizationid: new Types.ObjectId('63c0e7dad80176886c22129d'),
                        tguserid: tgData.message?.from?.id,
                        nativelanguage: tgData.message?.from?.language_code,
                        blocked: false,
                        created: new Date()
                    });
                    await user.save();
                    bot.sendMessage(tgData.message?.chat.id as number, tgWelcome.get(user.json?.nativelanguage?user.json?.nativelanguage:'en') as string, tg_bot_start_menu(user.json?.nativelanguage as string));
                }
            break;

            case '/getnext':
            break;

            case '/set_language':
                menuSetLanguage(bot, tgData.message?.chat.id as number, u as User);
                break;

            default: 
                bot.sendMessage(tgData.message?.chat.id as number, `'${command_name}' is unknoun command. Check spelling`);
                return false;
        }
    }
    return true;
}

function yt_id(url: string): string|undefined {
    const r = url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
    return r?r[1]:undefined;
}

function menuSetLanguage(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, choose_language.get(user.json?.nativelanguage as string)?choose_language.get(user.json?.nativelanguage as string) as string:choose_language.get('en') as string, tg_bot_set_language_menu);
}

async function yt_video_data(yt_video_id: string) {
    try{
        console.log();
        const youtube = google.youtube({
            version: "v3",
            auth: settings.yt_API_KEY,
        });
        const d = await youtube.videos.list({
            part: ['snippet'],
            id: [yt_video_id],
        });
        return d;
    } catch(e){
        console.log(`${colours.fg.red}YoutubeAPI error. API_KEY = '${settings.yt_API_KEY}'; error = '${e}'${colours.reset}`);
    }
}

async function processURLs(bot: TelegramBot, tgData: TelegramBot.Update): Promise<boolean> {
    // looking for URL
    const URLs = tgData.message?.entities?.filter(v => v.type == "url");
    if (!URLs || !(URLs as any).length) return false;
    console.log(`url(s) found: ${tgData.message?.text}`);
    for (let [i, u] of Object.entries(URLs)) {
        const url_name = tgData.message?.text?.substring(u.offset, u.offset + u.length);
        console.log(`${colours.fg.green}Processing URL = '${url_name}'${colours.reset}`);
        const ytId = yt_id(url_name as string);
        if (ytId){
            console.log(`YOUTUBE content found: videoId = '${ytId}'`);
            const data = (await yt_video_data(ytId) as any).data;
            // !! need error handling
            //console.log(data.items);
            let org = await getOrganizationByTgUser(bot, tgData);
            if (org){
                for (let [i, ytVi] of Object.entries(data.items)) {
                    let snippet: any = (ytVi as any).snippet;
                    console.log(`Title: '${snippet.title}', tags: '${snippet.tags}'`);
                    let ic: IContent = {
                        organizationid: org.json?._id,
                        url: url_name,
                        type: "video",
                        source: "youtube",
                        name: snippet.title,
                        tags:snippet.tags,
                        description:snippet.description,
                        language:snippet.defaultAudioLanguage,
                        blocked: false,
                        created: new Date(),
                        restrictions:[]
                    };
                    if (!ic.language) ic.language = 'en';
                    let content = new Content(undefined, ic);
                    await content.save();
                    const msg = `New content added`;
                    bot.sendMessage(tgData.message?.chat.id as number, msg, {disable_notification:true});
                }
            } else {
                const msg = `Role 'manage_content' expected`;
                bot.sendMessage(tgData.message?.chat.id as number, msg);
            }
        } else {
            console.log(`Couldn't recognize known domain: ${url_name}`);
        }
    }
    return true;
}

async function getOrganizationByTgUser(bot: TelegramBot, tgData: TelegramBot.Update): Promise<Organization|undefined> {
    PlutchikProto.connectMongo();
    const perms: Array<IOrganization> = await mongoOrgs.aggregate([
        {
            "$match": {
                "keys.tgUserId": tgData.message?.from?.id 
            }
        }
    ]);

    let org: Organization | undefined;
    console.log(`Organization keys found for user:`);
    for (const i in perms){
        org = new Organization(undefined, perms[i]);
        const ikey = await org.checkTgUserId(tgData.message?.from?.id as number);

        console.log(`${colours.fg.blue}found: organizationid = '${perms[i]._id}'; roles = '${ikey.roles}'${colours.reset}`);
        if (Organization.checkRoles(ikey.roles, "manage_content")) {
            return org;
        }
    }
    return;
}

async function addContent(bot: TelegramBot, tgData: TelegramBot.Update){
    PlutchikProto.connectMongo();
    const perms: Array<IOrganization> = await mongoOrgs.aggregate([
        {
            "$match": {
                "keys.tgUserId": tgData.message?.from?.id 
            }
        }
    ]);

    let org: Organization | undefined;
    console.log(`Organization keys found for user:`);
    for (const i in perms){
        org = new Organization(undefined, perms[i]);
        const ikey = await org.checkTgUserId(tgData.message?.from?.id as number);

        console.log(`${colours.fg.blue}found: organizationid = '${perms[i]._id}'; roles = '${ikey.roles}'${colours.reset}`);
        if (!Organization.checkRoles(ikey.roles, "manage_content")) {
            const msg = `Role 'manage_content' expected`;
            bot.sendMessage(tgData.message?.chat.id as number, msg);
            //return res.status(200).json(msg);
        }
    }
    let content: Content | undefined;
    if (tgData.message?.media_group_id) {
        const cc = await mongoContent.aggregate([{
            "$match": {
                "tgData.media_group_id":{
                    $eq: tgData.message?.media_group_id
                }
            }
        }]);
        if (cc.length) content = new Content(undefined, cc[0]);
    }
    if (!org) throw new PlutchikError("organization:notfound", `Unexpected situation`);
    if (!content) {
        let ic: IContent = {
            organizationid: org.json?._id,
            type: "memes",
            source: "telegram",
            name: tgData.message?.caption?tgData.message?.caption:'',
            tags:[],
            description:'',
            language:'',
            tgData: [],
            blocked: false,
            created: new Date(),
            restrictions:[]
        }
        content = new Content(undefined, ic);
    }
    const mc = content.json;
    mc?.tgData?.push(tgData.message as TelegramBot.Message);
    await content.load(mc);
    await content.save();
}