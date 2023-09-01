import { Request, Response } from 'express';
import PlutchikError, { ErrorCode } from '../model/error';
import colours from "../model/colours";
import TelegramBot from 'node-telegram-bot-api';
import Organization, { IOrganization, mongoOrgs } from '../model/organization';
import Content, { ContentGroup, IContent, mongoContent } from '../model/content';
import User, { mongoUsers } from '../model/user';
import { google } from 'googleapis';
import { Types } from 'mongoose';
import path from 'path';
import MongoProto from '../model/mongoproto';

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

function my_settings(lang: string){
    switch(lang) {
        case 'de': return 'Meine Einstellungen';
        case 'es': return 'Mi configuración';
        case 'ru': return 'Мои настройки';
        case 'uk': return 'Мої налаштування';
        case 'en':
        default: return 'My settings';
    }
}

function awareness(lang: string){
    switch(lang) {
        case 'de': return 'Hier ist, was wir bisher über Sie wissen';
        case 'es': return 'Esto es lo que sabemos de ti hasta ahora';
        case 'ru': return 'Вот что нам известно о Вас на данный момент';
        case 'uk': return 'Ось що нам відомо про Вас на даний момент';
        case 'en':
        default: return "Here's what we know about you so far";
    }
}

const set_language: Map<string, string> = new Map([
    ['en', 'Set language']
    ,['uk', 'Встановити мову']
    ,['ru', 'Установить язык']
    ,['es', 'Elegir lenguaje']
    ,['de', 'Sprache einstellen']
]);

function set_age(lang: string){
    switch (lang) {
        case 'es': return 'mi edad';
        case 'de': return 'mein Alter ein';
        case 'ru': return 'Мой возраст';
        case 'uk': return 'Мій вік';
        case 'en':
        default: return 'Set my age';
    }
}

const choose_language: Map<string, string> = new Map([
    ['en', 'Choose language']
    ,['uk', 'Виберіть мову']
    ,['ru', 'Выберите язык']
    ,['es', 'Elige lengua']
    ,['de', 'Sprache wählen']
]);

function set_gender(lang: string) {
    switch(lang) {
        case 'de': return 'Mein Geschlecht';
        case 'es': return 'Mi género';
        case 'ru': return 'Мой пол';
        case 'uk': return 'Моя стать';
        case 'en':
        default: return 'My gender';
    }
}

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

function str_gender_changed(lang: string) {
    switch(lang) {
        case 'de': return 'Das Geschlecht wurde eingestellt';
        case 'es': return 'Se ha cambiado el género';
        case 'ru': return 'Пол установлен';
        case 'uk': return 'Стать встановлено';
        case 'en':
        default: return 'Gender has been set';
    }
}

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

function choose_gender(lang: string):string {
    switch(lang) {
        case 'de': return 'Wählen Sie ein Geschlecht aus der Liste aus';
        case 'es': return 'Seleccione un género de la lista';
        case 'ru': return 'Выберите пол из списка';
        case 'uk': return 'Виберіть ґендер зі списку';
        case 'en':
        default: return 'Select a gender from the list';
    }
}

function invitation_to_assign(lang: string, from?: TelegramBot.User, group?: string):string {
    switch(lang) {
        case 'de': return `Sie haben von einem Benutzer eine Einladung erhalten '${group}' , Inhalte zu bewerten ${from?.first_name} ${from?.last_name}`;
        case 'es': return `Recibiste una invitación para calificar contenido '${group}' de un usuario  ${from?.first_name} ${from?.last_name}`;
        case 'ru': return `Вам пришло приглашение оценить контент '${group}' от пользователя ${from?.first_name} ${from?.last_name}`;
        case 'uk': return `Вам надійшло запрошення оцінити контент '${group}' від користувача ${from?.first_name} ${from?.last_name}`;
        case 'en':
        default: return `You received an invitation to assess content '${group}' from a user ${from?.first_name} ${from?.last_name}`;
    }
}

function accept_invitation(lang: string):string {
    switch(lang) {
        case 'de': return 'Ich nehme an';
        case 'es': return 'Acepto';
        case 'ru': return 'Принимаю приглашение';
        case 'uk': return 'Я приймаю';
        case 'en':
        default: return 'I accept';
    }
}

function decline_invitation(lang: string):string {
    switch(lang) {
        case 'de': return 'ich lehne ab';
        case 'es': return 'renuncio';
        case 'ru': return 'Отклоняю приглашение';
        case 'uk': return 'Я відмовляюся';
        case 'en':
        default: return 'I decline';
    }
}
function str_getMatched(lang: string):string {
    switch(lang) {
        case 'de': return 'Gematcht werden';
        case 'es': return 'Ser emparejado';
        case 'ru': return 'Получить соответствие';
        case 'uk': return 'Отримати відповідність';
        case 'en':
        default: return 'Get matched';
    }
}

const tg_bot_accept_group = (lang: string, groupname: string, from?: TelegramBot.User) => {
    return {
        reply_markup: {
            inline_keyboard: [[
                {text: accept_invitation(lang),
                callback_data: `accept_assignment:${groupname}:${from?.id}`
                }
            ],[
                {text: decline_invitation(lang),
                callback_data: `decline_assignment:${groupname}:${from?.id}`
                }
            ]]
        }
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
                            url: `${process.env.tg_web_hook_server}/assess.htm`
                        }
                    }
                    ,{
                        text: insights(lang),
                        web_app: {
                            url: `${process.env.tg_web_hook_server}/insights.htm`
                        }
                    }
                ],[
                    {
                        text: str_getMatched(lang),
                        web_app: {
                            url: `${process.env.tg_web_hook_server}/match.htm`
                        }
                    }
                ,
                    {
                        text: my_settings(lang),
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
                        url: `${process.env.tg_web_hook_server}/assess.htm`
                    }
                }
                ,{
                    text: insights(lang),
                    web_app: {
                        url: `${process.env.tg_web_hook_server}/insights.htm`
                    }
                }
        ]]
        }
    };
}

function tg_bot_settings_menu(lang: string, user: User):TelegramBot.SendMessageOptions {
    const age = user.json?.birthdate? new Date().getFullYear() - user.json?.birthdate.getFullYear():'??';
    let gender = '??';
    switch(user.json?.gender) {
        case 'male':  gender = strMale(lang);
            break;
        case 'female':  gender = strFemale(lang);
        break;
        case 'other':  gender = strOther(lang);
            break;
        default: gender = '??';
    }
    return {
        reply_markup: {
            inline_keyboard:[
                [
                    {
                        text: set_language.get(lang)?set_language.get(lang) as string:set_language.get('en') as string,
                        callback_data: 'select_language'
                    }
                    /*,{
                        text: 'Set my location',
                        callback_data: 'set_location'
                    }*/
                    ,{
                        text: `${set_age(lang)}: ${age}`,
                        callback_data: 'set_age'
                    }
                ],[
                    {
                        text: `${set_gender(lang)}: ${gender}`,
                        callback_data: 'select_gender'
                    },
                    {
                        text: deleteMyAccount(lang),
                        callback_data: 'delete_account'
                    }
                ]
                ,[
                    {
                        text: assess_new_content.get(lang)?assess_new_content.get(lang) as string:assess_new_content.get('en') as string,
                        web_app: {
                            url: `${process.env.tg_web_hook_server}/assess.htm`
                        }
                    }
                    ,{
                        text: insights(lang),
                        web_app: {
                            url: `${process.env.tg_web_hook_server}/insights.htm`
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
                    callback_data: 'set_language:en'
                }
                ,{
                    text: 'Español',
                    callback_data: 'set_language:es'
                }
                ,{
                    text: 'Deutsch',
                    callback_data: 'set_language:de'
                }
            ], [
                {
                    text: 'Українська',
                    callback_data: 'set_language:uk'
                }
                ,{
                    text: 'Русский',
                    callback_data: 'set_language:ru'
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
}
function strMale (lang: string){
    switch(lang) {
        case 'de': return 'Männlich';
        case 'es': return 'Masculina';
        case 'ru': return 'Мужчина';
        case 'uk': return 'Чоловік';
        case 'en':
        default: return 'Male';
    }
}
function strFemale(lang: string){
    switch(lang) {
        case 'de': return 'Weiblich';
        case 'es': return 'Femenina';
        case 'ru': return 'Женщина';
        case 'uk': return 'Жінка';
        case 'en':
        default: return 'Female';
    }
}

function strOther(lang: string){
    switch(lang) {
        case 'de': return 'Anderes Geschlecht';
        case 'es': return 'Otro género';
        case 'ru': return 'Другой';
        case 'uk': return 'Інша стать';
        case 'en':
        default: return 'FemOther genderale';
    }
}

function tg_bot_set_gender_menu(lang: string): TelegramBot.SendMessageOptions{
    return     {
        reply_markup: {
        inline_keyboard:[
            [
                {
                    text: strMale(lang),
                    callback_data: 'set_gender:male'
                },
                {
                    text: strFemale(lang),
                    callback_data: 'set_gender:female'
                }
            ],
            [
                {
                    text: strOther(lang),
                    callback_data: 'set_gender:other'
                }
            ]
        ]}
    }

}

function invitation_accepted (lang: string){
    switch(lang) {
        case 'de': return 'Sie haben die Einladung angenommen. Vielen Dank und viel Spaß. Button „Neue Inhalte bewerten“ drücken';
        case 'es': return 'Ha aceptado la invitación. Gracias y disfruta Presiona el botón "Evaluar nuevo contenido"';
        case 'ru': return 'Вы приняли приглашение. Спасибо. Получите удовольствие от процесса оценки. Нажмите кнопку "Оценить еще"';
        case 'uk': return 'Ви прийняли запрошення. Дякую і насолоджуйся. Натисніть кнопку «Оцінити новий контент»';
        case 'en':
        default: return 'You have accepted invitation. Thanks and enjoy. Press button "Assess new content"';
    }
}

function invitation_failed (lang: string){
    switch(lang) {
        case 'de': return 'Etwas ist schief gelaufen. Wir beschäftigen uns bereits damit.';
        case 'es': return 'Algo salió mal. Ya estamos lidiando con esto."';
        case 'ru': return 'Что-то пошло не так. МЫ уже разбираемся с этим"';
        case 'uk': return 'Щось пішло не так. Ми вже розуміємо це';
        case 'en':
        default: return 'Something went wrong. We are already dealing with this.';
    }
}

function invitation_declined (lang: string){
    switch(lang) {
        case 'de': return 'Ihre Ablehnung wurde akzeptiert';
        case 'es': return 'Su rechazo ha sido aceptado"';
        case 'ru': return 'Ваш отказ принят';
        case 'uk': return 'Ваш отказ принят';
        case 'en':
        default: return 'Your refusal has been accepted';
    }
}

export default async function telegram(c: any, req: Request, res: Response, bot: TelegramBot) {
    console.log(`${colours.fg.green}API: telegram function${colours.reset}`);
    const tgData: TelegramBot.Update = req.body;
    if (tgData.callback_query){
        try {
            const u = await User.getUserByTgUserId(tgData.callback_query.from.id as number);
            if (!u) {
                bot.sendMessage(tgData.callback_query?.message?.chat.id as number, userNotFound(tgData.callback_query.from.language_code as string));
                return res.status(200).json("User not found");
            }

            console.log(`Callback command '${tgData.callback_query.data}'`);
            // waiting command with : separator, f.e. accept_assign:userid
            // or without :, f.e. settings
            const cbcommand = tgData.callback_query.data?tgData.callback_query.data?.split(':'):'';

            switch(cbcommand[0]) {
                case 'settings':
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, awareness(u?.json?.nativelanguage as string), tg_bot_settings_menu(u?.json?.nativelanguage as string, u));
                    break;
                case 'select_gender':
                    menuSetGender(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                case 'set_gender':
                    const gender = cbcommand[1];
                    u.setGender(gender);
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, str_gender_changed(u?.json?.nativelanguage as string), tg_bot_start_menu(u?.json?.nativelanguage as string));
                    break;
                case 'select_language':
                    menuSetLanguage(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                case 'set_language':
                    const lang = cbcommand[1];
                    console.log(`Changing user's language to '${lang}'`);
                    await u?.changeNativeLanguage(lang);
                    bot.sendMessage(tgData.callback_query?.message?.chat.id as number, language_changed.get(lang)?language_changed.get(lang) as string:language_changed.get('en') as string, tg_bot_start_menu(u?.json?.nativelanguage as string));
                    break;
                case 'set_age':
                    menuSetAge(bot, tgData.callback_query?.message?.chat.id as number, u as User);
                    break;
                case 'accept_assignment':
                    console.log(`Accept assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
                    const g = await ContentGroup.findContentGroup(cbcommand[1]);
                    const from_user = await User.getUserByTgUserId(parseInt(cbcommand[2]));
                    if (from_user && g) {
                        await u.assignContentGroup(from_user, g);
                        //sending message to psycologist
                        bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} accepted your invitation`);
                        //sending message to patient
                        bot.sendMessage(tgData.callback_query.from.id, invitation_accepted(u?.json?.nativelanguage as string), tg_bot_start_menu(u?.json?.nativelanguage as string));
                    } else {
                        //something was wrong either from_user or content group
                        //sending message to psycologist
                        bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} couldn't accept your invitation. But tried. Group name = '${cbcommand[1]}'`);
                        //sending message to patient
                        bot.sendMessage(tgData.callback_query.from.id, invitation_failed(u?.json?.nativelanguage as string), tg_bot_start_menu(u?.json?.nativelanguage as string));
                    }
                    break;
                case 'decline_assignment':
                    console.log(`Decline assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
                    bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} declined your invitation. Group name = '${cbcommand[1]}'`);
                    //sending message to patient
                    bot.sendMessage(tgData.callback_query.from.id, invitation_declined(u?.json?.nativelanguage as string), tg_bot_start_menu(u?.json?.nativelanguage as string));
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

    const u = await User.getUserByTgUserId(tgData.message?.from?.id as number);
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
            //&& !await processURLs(bot, tgData)) 
            ){
                bot.sendMessage(tgData.message?.chat.id as number, `Sorry, i couldn't apply this content. Check spelling`);
            };
        
        return res.status(200).json("OK");
    } catch (e: any) {
        return res.status(400).json(e);
    }
}


const tgWelcome = (lang: string, userid: number)=>{
    switch(lang){
        case 'uk': return `Ласкаво просимо! Цей бот допомагає динамічно оцінити вашу психологічну стійкість. Також це дозволяє вам знайти людей зі схожим мисленням. Ми поважаємо вашу конфіденційність. Будьте впевнені, що ми видалимо всі ваші дані у будь-який час на ваш запит. Ваш ID=${userid}. Повідомте його, хто підготував для Вас контент для оцінки`;
        case 'ru': return `Добро пожаловать! Этот бот помогает динамически оценить вашу психологическую устойчивость. Также он позволяет вам найти людей со схожим мышлением. Мы уважаем вашу конфиденциальность. Будьте уверены, что мы удалим все ваши данные в любое время по вашему запросу\nВаш ID=${userid}. Сообщите его тому, кто подготовил для Вас контент для оценки`;
        case 'es': return `¡Bienvenido! Este bot te ayuda a evaluar dinámicamente tu resiliencia mental. También te permite encontrar personas con mentalidades similares. Respetamos tu privacidad. Tenga la seguridad de que eliminaremos todos sus datos en cualquier momento si lo solicita. Tu identificación = ${userid}. Cuéntaselo a la persona que preparó el contenido para que lo evalúes`;
        case 'de': return `Willkommen zurück! Dieser Bot hilft Ihnen, Ihre mentale Belastbarkeit dynamisch einzuschätzen. Es ermöglicht Ihnen auch, Menschen mit ähnlichen Denkweisen zu finden. Wir respektieren deine Privatsphäre. Seien Sie versichert, dass wir alle Ihre Daten jederzeit auf Ihren Wunsch löschen werden. Ihre ID = ${userid}. Teilen Sie es der Person mit, die den Inhalt für Sie zur Bewertung vorbereitet hat`;
        case 'en':
        default:
            return `Welcome! This bot helps evaluate you psycology sustainability  dynamically. Also it provides you finding people with similar mindset. We respect your privacy. Be sure that we'll delete all your data at any moment you request. Your ID is ${userid}.`;
    }
}

async function processCommands(bot: TelegramBot, tgData: TelegramBot.Update): Promise<boolean> {
    // looking for bot-command from user
    const commands = tgData.message?.entities?.filter(v => v.type == "bot_command");
    if (!commands || !(commands as any).length ) return false;
    console.log(`command(s) found: ${tgData.message?.text}`);
    for (let [i, c] of Object.entries(commands as Array<TelegramBot.MessageEntity>)) {
        const command_name = tgData.message?.text?.substring(c.offset, c.offset + c.length);
        console.log(`${colours.fg.green}Processing command = '${command_name}'${colours.reset}`);
        const u = await User.getUserByTgUserId(tgData.message?.from?.id as number);
        switch (command_name) {
            case '/start': 
                 if (u){
                    bot.sendMessage(tgData.message?.chat.id as number, tgWelcome(u.json?.nativelanguage as string, tgData.message?.from?.id as number), tg_bot_start_menu(u.json?.nativelanguage as string));
                } else {
                    const user = new User(undefined, {
                        tguserid: tgData.message?.from?.id as number,
                        nativelanguage: tgData.message?.from?.language_code,
                        blocked: false,
                        created: new Date()
                    });
                    await user.save();
                    bot.sendMessage(tgData.message?.chat.id as number, tgWelcome(user.json?.nativelanguage as string, tgData.message?.from?.id as number), tg_bot_start_menu(user.json?.nativelanguage as string));
                }
            break;

            case '/assign':
                const sp = tgData.message?.text?.split(' ');
                if (!sp || sp?.length != 3) {
                    bot.sendMessage(tgData.message?.chat.id as number, `ASSIGN command format: /assign <group_name> <userid>`, {disable_notification: true});
                } else {
                    console.log(`User ${u?.uid} wants to assign group '${sp[1]}' to user '${sp[2]}'`);
                    const assign_user = parseInt(sp[2])?User.getUserByTgUserId(parseInt(sp[2])):undefined;
                    if (!assign_user) {
                        bot.sendMessage(tgData.message?.chat.id as number, `User #${sp[2]} not found`, {disable_notification: true});
                    } else {
                        bot.sendMessage(parseInt(sp[2]), invitation_to_assign(u?.json?.nativelanguage as string, tgData.message?.from, sp[1]), tg_bot_accept_group(u?.json?.nativelanguage as string, sp[1], tgData.message?.from));
                    }
                }
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

function menuSetGender(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, choose_gender(user.json?.nativelanguage as string), tg_bot_set_gender_menu(user.json?.nativelanguage as string));
}

function menuDeleteAccount(bot: TelegramBot, chat_id: number, user: User){
    bot.sendMessage(chat_id, choose_delete_way(user.json?.nativelanguage as string), tg_bot_set_delete_menu(user.json?.nativelanguage as string));
}

async function yt_video_data(yt_video_id: string) {
    try{
        console.log();
        const youtube = google.youtube({
            version: "v3",
            auth: process.env.yt_API_KEY,
        });
        const d = await youtube.videos.list({
            part: ['snippet'],
            id: [yt_video_id],
        });
        return d;
    } catch(e){
        console.log(`${colours.fg.red}YoutubeAPI error. API_KEY = '${process.env.yt_API_KEY}'; error = '${e}'${colours.reset}`);
    }
}

