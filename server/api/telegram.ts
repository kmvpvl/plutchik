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

function insights(lang: string) {
    switch(lang) {
        case 'de': return 'Einblicke';
        case 'es': return 'Perspectivas';
        case 'ru': return 'Инсайты';
        case 'uk': return 'Інсайти';
        case 'en':
        default: return 'Insights';
    }
}

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

const set_age: Map<string, string> = new Map([
    ['en', 'Set my age']
    ,['uk', 'Встановити мій вік']
    ,['ru', 'Ввести мой возраст']
    ,['es', 'establecer mi edad']
    ,['de', 'Stellen Sie mein Alter ein']
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

const enter_age: Map<string, string> = new Map([
    ['en', 'Enter your age']
    ,['uk', 'Введіть свій вік']
    ,['ru', 'Введите свой возраст']
    ,['es', 'Introduzca su edad']
    ,['de', 'Gebe Dein Alter ein']
]);

function choose_delete_way(lang: string) {
    switch(lang) {
        case 'de': return 'Wir bedauern sehr, dass Sie uns verlassen. Bitte wählen Sie eine Methode zum Löschen Ihrer Daten';
        case 'es': return 'Lamentamos mucho que nos dejes. Seleccione un método para eliminar sus datos';
        case 'ru': return 'Нам очень жаль, что вы покидаете нас. Пожалуйста, выберите способ удаления ваших данных';
        case 'uk': return 'Нам дуже шкода, що ви залишаєте нас. Будь ласка, виберіть спосіб видалення ваших даних';
        case 'en':
        default: return 'We are very sorry that you are leaving us. Please select a method for deleting your data';
    }
}

function notANumber(lang: string) {
    switch(lang) {
        case 'de': return 'Das Alter muss eine ganze Zahl sein';
        case 'es': return 'La edad debe ser un número entero.';
        case 'ru': return 'Возраст должен быть целым числом';
        case 'uk': return 'Вік має бути цілим числом';
        case 'en':
        default: return 'The age must be a whole number';
    }
}

function ageSet(lang: string):string {
    switch(lang) {
        case 'de': return 'Das Alter wurde erfolgreich eingestellt';
        case 'es': return 'La edad se ha fijado con éxito';
        case 'ru': return 'Возраст установлен успешно';
        case 'uk': return 'Вік поставив вдало';
        case 'en':
        default: return 'The age has set successfully';
    }
}
function deleteMyAccount(lang: string):string {
    switch(lang) {
        case 'de': return 'mein Konto löschen';
        case 'es': return 'borrar mi cuenta';
        case 'ru': return 'Удалить мои данные';
        case 'uk': return 'видалити мої дані';
        case 'en':
        default: return 'Delete my account';
    }
}

function accountDeleted(lang: string):string {
    switch(lang) {
        case 'de': return 'Ihr Konto wurde erfolgreich gelöscht. Um fortzufahren, geben Sie /start ein';
        case 'es': return 'Su cuenta eliminada con éxito. Para reanudar escriba /start';
        case 'ru': return 'Ваша учетная запись удалена успешно. Чтобы возобновить введите /start';
        case 'uk': return 'Ваш обліковий запис успішно видалено. Щоб відновити, введіть /start';
        case 'en':
        default: return 'Your accaunt deleted successfully. To resume type /start';
    }
}

function userNotFound(lang: string):string {
    switch(lang) {
        case 'de': return 'Entschuldigung, Ihr Konto wurde nicht gefunden. Drücke /start';
        case 'es': return 'Lo sentimos, no se encontró su cuenta. Presiona /start';
        case 'ru': return 'Ваша учетная запись не найдена. Чтобы возобновить введите /start';
        case 'uk': return 'Вибачте, ваш обліковий запис не знайдено. Натисніть /start';
        case 'en':
        default: return 'Sorry, your account not found. Press /start';
    }
}

function deleteMyAccountA(lang: string):string {
    switch(lang) {
        case 'de': return 'Lassen Sie Bewertungen anonym. Nur Konto löschen';
        case 'es': return 'Dejar evaluaciones anónimas. Eliminar cuenta solamente';
        case 'ru': return 'Оценки оставить анонимно. Удалить только учетную запись';
        case 'uk': return 'Залиште оцінки анонімними. Видалити лише обліковий запис';
        case 'en':
        default: return 'Leave assessments anonymous. Delete account only';
    }
}

function deleteMyAccountB(lang: string):string {
    switch(lang) {
        case 'de': return 'Alles löschen';
        case 'es': return 'Eliminar todos';
        case 'ru': return 'Удалить всё';
        case 'uk': return 'Видалити все';
        case 'en':
        default: return 'Delete all';
    }
}
function tg_bot_start_menu(lang: string, manage: boolean = false):TelegramBot.SendMessageOptions {
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
                        text: insights(lang),
                        web_app: {
                            url: `${settings.tg_web_hook_server}/telegram?insights`
                        }
                    }
                ],[
                    {
                        text: `Content management`,
                        web_app: {
                            url: `${settings.tg_web_hook_server}/telegram?content`
                        }
                    }
                ],[
                    {
                        text: my_settings.get(lang)?my_settings.get(lang) as string:my_settings.get('en') as string,
                        callback_data: 'settings'
                    }
                ]
            ]
        }
    }
};

function tg_bot_set_delete_menu(lang: string):TelegramBot.SendMessageOptions {
    return {
        reply_markup: {
            inline_keyboard:[
                [
                    {
                        text: deleteMyAccountA(lang),
                        callback_data: 'delete_my_account_a'
                    }
                ],[
                    {
                        text: deleteMyAccountB(lang),
                        callback_data: 'delete_my_account_b'
                    }
                ]
            ]
        }
    }
};

function tg_bot_set_location_menu(lang: string):TelegramBot.SendMessageOptions {
    return {
        reply_markup: {
            keyboard: [[
                {
                    text: "Send location",
                    request_location: true
                }
                ,{
                    text: assess_new_content.get(lang)?assess_new_content.get(lang) as string:assess_new_content.get('en') as string,
                    web_app: {
                        url: `${settings.tg_web_hook_server}/telegram`
                    }
                }
                ,{
                    text: insights(lang),
                    web_app: {
                        url: `${settings.tg_web_hook_server}/telegram?insights`
                    }
                }
        ]]
        }
    };
}

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
                    ,{
                        text: set_age.get(lang)?set_age.get(lang) as string:set_age.get('en') as string,
                        callback_data: 'set_age'
                    }
                ],[
                    {
                        text: deleteMyAccount(lang),
                        callback_data: 'delete_account'
                    }
                ]
                ,[
                    {
                        text: assess_new_content.get(lang)?assess_new_content.get(lang) as string:assess_new_content.get('en') as string,
                        web_app: {
                            url: `${settings.tg_web_hook_server}/telegram`
                        }
                    }
                    ,{
                        text: insights(lang),
                        web_app: {
                            url: `${settings.tg_web_hook_server}/telegram?insights`
                        }
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
            if (!u) {
                bot.sendMessage(tgData.callback_query?.message?.chat.id as number, userNotFound(tgData.callback_query.from.language_code as string));
                return res.status(200).json("User not found");
            }

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
                case 'set_age':
                    menuSetAge(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                
                case 'delete_account':
                    menuDeleteAccount(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                case 'delete_my_account_a':
                case 'delete_my_account_b':
                    await u.deleteTgUser();
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, accountDeleted(u?.json?.nativelanguage as string));
                    break;

                case 'set_location':
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, 'get location', tg_bot_set_location_menu(u?.json?.nativelanguage as string));
                    break;
                
                default: bot.sendMessage(tgData.callback_query?.message?.chat.id as number, `Unknown callback command '${tgData.callback_query.data}'`, tg_bot_start_menu(u?.json?.nativelanguage as string));
            }
            return res.status(200).json("OK");
        } catch (e: any) {
            return res.status(400).json(e);
        }
    }
    console.log(`${colours.fg.blue}Telegram userId = '${tgData.message?.from?.id}'${colours.reset}; chat_id = '${tgData.message?.chat.id}'`);

    const u = await getUserByTgUserId(tgData.message?.from?.id as number);
    if (u?.json?.awaitcommanddata){
        switch(u?.json?.awaitcommanddata) {
            case 'set_age':
                const age = parseInt(tgData.message?.text as string);
                if (isNaN(age)) {
                    bot.sendMessage(tgData.message?.chat.id as number, notANumber(u?.json?.nativelanguage as string));
                } else {
                    await u.setAge(age);
                    await u.setAwaitCommandData();
                    bot.sendMessage(tgData.message?.chat.id as number, ageSet(u?.json?.nativelanguage as string), tg_bot_start_menu(u?.json?.nativelanguage as string));
                }
                return res.status(200).json("OK");
                break;

            default:
                await u.setAwaitCommandData();
                return res.status(200).json("OK");
        }
    }
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
                case 'observe':
                    user = await getUserByTgUserId(parseInt(req.query['tg_user_id'] as string));
                    if (user) {
                        const org = new Organization(user.json?.organizationid);
                        await org.load();
                        const ob = await user.observeAssessments();
                        return res.status(200).json({observe: ob, user: user.json});
                    }
                    break;
                case 'manage_content':
                    user = await getUserByTgUserId(parseInt(req.query['tg_user_id'] as string));
                    if (user) {
                        const org = new Organization(user.json?.organizationid);
                        await org.load();
                        const letters = await org.getFirstLettersOfContentItems();
                        const st = await org.checkAndUpdateSessionToken(user.json?._id as Types.ObjectId, ["manage_content"]);
                        const ci = await org.getContentItems();
                        return res.status(200).json({org: org.json, user: user.json, letters: letters, items: ci, sessiontoken: st});
                    }
                    break;
                default:
                    return res.status(404).json({result: 'FAIL', description: 'Unknown command'});
            }
            return res.status(200).json('OK');
        } else 
            if (req.query ['insights'] === '')
                return res.sendFile("insights.htm", {root: __dirname});
            else if (req.query ['content'] === '')
                return res.sendFile("content.htm", {root: __dirname});
            else 
                return res.sendFile("assess.htm", {root: __dirname});
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
    if (!url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)) return undefined;
    const r = url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
    return r?r[1]:undefined;
}

function menuSetLanguage(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, choose_language.get(user.json?.nativelanguage as string)?choose_language.get(user.json?.nativelanguage as string) as string:choose_language.get('en') as string, tg_bot_set_language_menu);
}

function menuSetAge(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, enter_age.get(user.json?.nativelanguage as string)?enter_age.get(user.json?.nativelanguage as string) as string:enter_age.get('en') as string);
    user.setAwaitCommandData("set_age");
}

function menuDeleteAccount(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, choose_delete_way(user.json?.nativelanguage as string), tg_bot_set_delete_menu(user.json?.nativelanguage as string));
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
    let org = await getOrganizationByTgUser(bot, tgData);
    const media_props = tgData.message?.text?.split(':');
    const media_type = media_props?media_props[0]:undefined;
    const media_lang = media_props?media_props[1]:undefined;
    const media_name = media_props?media_props[2]:undefined;
    const media_desc = media_props?media_props[3]:undefined;
    
    const URLs = tgData.message?.entities?.filter(v => v.type == "url");
    if (!URLs || !(URLs as any).length) {
        switch(media_type){
            case 'text':
                console.log(`Text found: Name = '${media_name}', lang = '${media_lang}'`);
                if (org) {
                    let ic: IContent = {
                        organizationid: org.json?._id,
                        type: "text",
                        source: "embedded",
                        name: media_name as string,
                        tags:[],
                        tgData: tgData,
                        description: media_desc as string,
                        language:media_lang as string,
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
                return true;
            default:
                return false;
            }
    }
    console.log(`url(s) found: ${tgData.message?.text}`);
    for (let [i, u] of Object.entries(URLs)) {
        const url_name = tgData.message?.text?.substring(u.offset, u.offset + u.length);
        console.log(`${colours.fg.green}Processing URL = '${url_name}'${colours.reset}`);
        switch (media_type) {
            case 'img':
                console.log(`Image found: Name = '${media_name}', lang = '${media_lang}'`);
                if (org) {
                    let ic: IContent = {
                        organizationid: org.json?._id,
                        url: url_name,
                        type: "image",
                        source: "web",
                        name: media_name as string,
                        tgData: tgData,
                        tags:[],
                        description: media_desc as string,
                        language:media_lang as string,
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
                break;
            default:
                const ytId = yt_id(url_name as string);
                if (ytId){
                    console.log(`YOUTUBE content found: videoId = '${ytId}'`);
                    const data = (await yt_video_data(ytId) as any).data;
                    // !! need error handling
                    //console.log(data.items);
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
                                tgData:tgData,
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

    }
    return true;
}

async function processMedia(bot: TelegramBot, tgData: TelegramBot.Update): Promise<boolean> {
    return false;
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

