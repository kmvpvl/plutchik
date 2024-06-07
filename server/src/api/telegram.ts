import { Request, Response } from 'express';
import PlutchikError, { ErrorCode } from '../model/error';
import colours from "../model/colours";
import TelegramBot, { KeyboardButton } from 'node-telegram-bot-api';
import Organization, { IOrganization, mongoOrgs } from '../model/organization';
import Content, { ContentGroup, IContent, mongoContent } from '../model/content';
import User, { mongoUsers } from '../model/user';
import { google } from 'googleapis';
import { Types } from 'mongoose';
import path from 'path';
import MongoProto from '../model/mongoproto';
import ML from '../model/mlstring';

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

function tg_bot_settings_menu(lang: string, user: User):TelegramBot.SendMessageOptions {
    function strMyName(lang: string):string {
        switch(lang) {
            case 'de': return 'Mein Name';
            case 'es': return 'Mi nombre';
            case 'ru': return 'Мое имя';
            case 'uk': return 'Моє ім\'я';
            case 'en':
            default: return 'My name';
        }
    }
        
    function strMyStudyGroup(lang: string):string {
        switch(lang) {
            case 'de': return 'Meine Lerngruppe';
            case 'es': return 'mi grupo de estudio';
            case 'ru': return 'Моя группа исследования';
            case 'uk': return 'Моя навчальна група';
            case 'en':
            default: return 'My study group';
        }
    }

    function strShareLocation(lang: string):string {
        switch(lang) {
            case 'de': return 'Meinen Standort teilen';
            case 'fr': return 'Partager ma position';
            case 'es': return 'compartir mi ubicación';
            case 'ru': return 'Мое местоположение';
            case 'uk': return 'Поділитися моїм розташуванням';
            case 'en':
            default: return 'Share my location';
        }
    }

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
                        text: `${strMyName(lang)}: ${user.json?.name?user.json?.name:'??'}`,
                        callback_data: 'select_name'
                    }
                ],[
                    {
                        text: set_language.get(lang)?set_language.get(lang) as string:set_language.get('en') as string,
                        callback_data: 'select_language'
                    }
                    ,{
                        text: `${set_age(lang)}: ${age}`,
                        callback_data: 'set_age'
                    }
                ],[
                    {
                        text: strShareLocation(lang),
                        callback_data: 'share_location'
                    }
                ], [
                    {
                        text: `${set_gender(lang)}: ${gender}`,
                        callback_data: 'select_gender'
                    },
                    {
                        text: deleteMyAccount(lang),
                        callback_data: 'delete_account'
                    }
                ],[
                    {
                        text: `${strMyStudyGroup(lang)}: ${user.json?.studygroup?user.json?.studygroup:'??'}`,
                        callback_data: 'select_studygroup'
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
const tg_bot_set_studygroup:TelegramBot.SendMessageOptions = {
    reply_markup: {
        inline_keyboard:[
            [
                {
                    text: 'МЭК-23-1',
                    callback_data: 'set_studygroup:МЭК-23-1'
                }
            ],
            [
                {
                    text: 'МЭК-23-2',
                    callback_data: 'set_studygroup:МЭК-23-2'
                }
            ],
            [
                {
                    text: 'МЭК-23-3',
                    callback_data: 'set_studygroup:МЭК-23-3'
                }
            ],
            [
                {
                    text: 'ММН-23-1',
                    callback_data: 'set_studygroup:ММН-23-1'
                }
            ],
            [
                {
                    text: 'ММН-23-2',
                    callback_data: 'set_studygroup:ММН-23-2'
                }
            ],
            [
                {
                    text: '-',
                    callback_data: 'set_studygroup:'
                }
            ],
            [
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

function tg_bot_select_name_menu(lang: string): TelegramBot.SendMessageOptions{
    function strSelectTelegramName(lang: string): string {
        switch(lang) {
            case 'de': return 'Mein Name von Telegram';
            case 'es': return 'Mi nombre de Telegram';
            case 'ru': return 'Мое имя в Телеграм';
            case 'uk': return 'Моє ім \'я з Telegram';
            case 'en':
            default: return 'My name from Telegram';
        }
    }
    function strIEnterMyName(lang: string): string {
        switch(lang) {
            case 'de': return 'Ich gebe meinen Namen ein';
            case 'es': return 'ingresaré mi nombre';
            case 'ru': return 'Я введу свое имя';
            case 'uk': return 'Я введу своє ім\'я';
            case 'en':
            default: return 'I\'ll enter my name';
        }
    }
    function strClearMyName(lang: string): string {
        switch(lang) {
            case 'de': return 'Lösche meinen Namen';
            case 'es': return 'Limpiar mi nombre';
            case 'ru': return 'Удалите мое имя';
            case 'uk': return 'Очистіть моє ім\'я';
            case 'en':
            default: return 'Clear my name';
        }
    }
    return     {
        reply_markup: {
        inline_keyboard:[
            [
                {
                    text: strSelectTelegramName(lang),
                    callback_data: 'set_name:tguser'
                },
                {
                    text: strIEnterMyName(lang),
                    callback_data: 'set_name:input'
                }
            ], [
                {
                    text: strClearMyName(lang),
                    callback_data: 'set_name:clear'
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
    console.log(`${colours.fg.blue}API: telegram function${colours.reset}`);
    const tgData: TelegramBot.Update = req.body;

    const tgUserId = tgData.callback_query?.message?.chat.id?tgData.callback_query?.message?.chat.id:tgData.message?.from?.id as number;
    let tgLanguageCode = tgData.callback_query?.from.language_code?tgData.callback_query?.from.language_code:tgData.message?.from?.language_code;
    console.log(`${colours.fg.blue}tgUserId = '${tgUserId}', tgLanguage = '${tgLanguageCode}' ${colours.reset}`);
    try {
        const userDraft = await User.getUserByTgUserId(tgUserId);
        
        tgLanguageCode = userDraft?.json?.nativelanguage?userDraft.json?.nativelanguage:'en';
        const MainKeyboardMenu = [[
            {text: ML('Assess new content', tgLanguageCode), web_app: {url: `${process.env.tg_web_hook_server}/assess.htm`}}, 
            {text: ML('Insights', tgLanguageCode), web_app: {url: `${process.env.tg_web_hook_server}/insights.htm`}},
        ],[
            {text: ML('Get matched', tgLanguageCode), web_app: {url: `${process.env.tg_web_hook_server}/match.htm`}},
            {text: ML('My settings', tgLanguageCode), callback_data: 'settings'}
        ]];
        if (tgData.callback_query !== undefined) {
            // it's callback
            callback_process(tgData, bot, userDraft as User, tgLanguageCode, MainKeyboardMenu);
            return res.status(200).json("OK");
        }
        // it isn't callback. This message may be command or data from user or message to support
        message_process(tgData, bot, userDraft as User, tgLanguageCode, MainKeyboardMenu);
        return res.status(200).json("OK");

    } catch (e) {
        bot.sendMessage(tgUserId, ML('Sorry, your account not found. Press /start', tgLanguageCode));
        return res.status(200).json("User not found");
    }
}

async function callback_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User, ulang: string, mainKeyboard: KeyboardButton[][]): Promise<boolean> {
    const callback = tgData.callback_query?.data as string;
    const chat_id = tgData.callback_query?.message?.chat.id as number;
    console.log(`Callback command '${callback}'`);
    // waiting command with : separator, f.e. accept_assign:userid
    // or without :, f.e. settings
    const cbcommand = callback.split(':');
    switch(cbcommand[0]) {
        case 'settings':
            bot.sendMessage(chat_id, ML('Here\'s what we know about you so far', ulang), tg_bot_settings_menu(ulang, user));
            break;
        case 'select_gender':
            menuSetGender(bot, chat_id as number, user);
            break;
        case 'set_gender':
            const gender = cbcommand[1];
            await user.setGender(gender);
            bot.sendMessage(chat_id as number, str_gender_changed(ulang));
            break;
        case 'select_name':
            menuSetName(bot, chat_id as number, user);
            break;
        case 'set_name':
            const setnameway = cbcommand[1];
            if ("input" === setnameway) {
                bot.sendMessage(chat_id, ML('Enter your name', ulang));
                await user.setAwaitCommandData("set_name");
                break;
            }
            switch (setnameway) {
                case 'tguser':
                    await user.setName(`${tgData.callback_query?.from.first_name} ${tgData.callback_query?.from.last_name}`);
                    break;
                case 'clear':
                    await user.setName();
                    break;                            
            }
            bot.sendMessage(chat_id, ML('Your name\'s been changed', ulang as string), tg_bot_settings_menu(ulang, user));
            break;
        case 'select_studygroup':
            menuSetStudyGroup(bot, chat_id as number, user);
            break;
        case 'set_studygroup':
            function strStudyGroupChanged(lang: string) {
                switch(lang) {
                    case 'de': return 'Ihre Lerngruppe hat sich geändert';
                    case 'es': return 'Tu grupo de estudio ha cambiado.';
                    case 'ru': return 'Ваша группа изменена';
                    case 'uk': return 'Ваша навчальна група змінилася';
                    case 'en':
                    default: return 'Your study group has changed';
                }
            }
            const studygroup = cbcommand[1] === ''?undefined:cbcommand[1];
            await user.setStudyGroup(studygroup);
            bot.sendMessage(chat_id, strStudyGroupChanged(ulang), tg_bot_settings_menu(ulang, user));
            break;
        case 'select_language':
            menuSetLanguage(bot, chat_id, user);
            break;
        case 'set_language':
            const lang = cbcommand[1];
            console.log(`Changing user's language to '${lang}'`);
            await user.changeNativeLanguage(lang);
            bot.sendMessage(chat_id, language_changed.get(lang)?language_changed.get(lang) as string:language_changed.get('en') as string);
            break;
        case 'set_age':
            menuSetAge(bot, chat_id, user);
            break;
        case 'accept_assignment':
            console.log(`Accept assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
            const g = await ContentGroup.findContentGroup(cbcommand[1]);
            const from_user = await User.getUserByTgUserId(parseInt(cbcommand[2]));
            if (from_user && g) {
                await user.assignContentGroup(from_user, g);
                //sending message to psycologist
                bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query?.from.first_name} ${tgData.callback_query?.from.last_name} accepted your invitation`);
                //sending message to patient
                bot.sendMessage(tgData.callback_query?.from.id as number, invitation_accepted(ulang));
            } else {
                //something was wrong either from_user or content group
                //sending message to psycologist
                bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query?.from.first_name} ${tgData.callback_query?.from.last_name} couldn't accept your invitation. But tried. Group name = '${cbcommand[1]}'`);
                //sending message to patient
                bot.sendMessage(tgData.callback_query?.from.id as number, invitation_failed(ulang));
            }
            break;
        case 'decline_assignment':
            console.log(`Decline assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
            bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query?.from.first_name} ${tgData.callback_query?.from.last_name} declined your invitation. Group name = '${cbcommand[1]}'`);
            //sending message to patient
            bot.sendMessage(tgData.callback_query?.from.id as number, invitation_declined(ulang));
        break;
        case 'delete_account':
            menuDeleteAccount(bot, chat_id, user);
            break;
        case 'delete_my_account_a':
        case 'delete_my_account_b':
            await user.deleteTgUser();
            bot.sendMessage(chat_id, accountDeleted(ulang));
            break;

        case 'share_location':
            bot.sendMessage(chat_id, ML('Options to share location', ulang), 
                {reply_markup: {inline_keyboard: [
                        [{text: ML('Share real location', ulang),
                        callback_data: 'share_real_location'}]
                        ,[{text: ML('Type region or country', ulang),
                        callback_data: 'share_country_location'}]
                        ,[{text: ML("Hide my location", ulang),
                        callback_data: 'hide_location'}]
                        ,[{text: ML('My settings', ulang),
                        callback_data: 'settings'}]
                ]}})
            break;

        case 'share_real_location':
            bot.sendMessage(tgData.callback_query?.message?.chat.id as number, ML('Press button to share you location below'), 
            {reply_markup:{keyboard:[[{text: 'Location', request_location: true}]], one_time_keyboard: true}});
            break;

        default: bot.sendMessage(tgData.callback_query?.message?.chat.id as number, `Unknown callback command '${tgData.callback_query?.data}'`);
    }
    return true;
}

async function message_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User, lang: string, mainKeyboard: KeyboardButton[][]): Promise<boolean> {
    const chat_id = tgData.message?.chat.id as number;
    console.log(`${colours.fg.blue}Telegram message processing userId = '${tgData.message?.from?.id}'${colours.reset}; chat_id = '${chat_id}'`);
    // is waiting data from user?
    if (user.json?.awaitcommanddata){
        switch(user.json?.awaitcommanddata) {
            case 'set_age':
                const age = parseInt(tgData.message?.text as string);
                if (isNaN(age)) {
                    bot.sendMessage(tgData.message?.chat.id as number, notANumber(lang));
                } else {
                    await user.setAge(age);
                    await user.setAwaitCommandData();
                    bot.sendMessage(tgData.message?.chat.id as number, ageSet(lang));
                }
                break;
            
            case 'set_name':
                await user.setName(tgData.message?.text);
                await user.setAwaitCommandData();
                bot.sendMessage(tgData.message?.chat.id as number, ML('Your name\'s been changed', lang), tg_bot_settings_menu(lang, user));
                break;
            default:
                await user.setAwaitCommandData();
        }
        return true;
    }
    // is command?
    if (await command_process(tgData, bot, user, lang, mainKeyboard)) {
        return true;
    } else {
        //message to support
        const staff = process.env.help_support_staff?.split(',');
        if (staff !== undefined) {
            //to check is it reply from support staff
            const isMsgFromStaff = staff.filter(v=>v === tgData.message?.from?.id.toString()).length > 0;
            const isReply = tgData.message?.reply_to_message !== undefined;

            if (isMsgFromStaff && isReply) {
                //staff reply
                const parent_message = tgData.message?.reply_to_message?.text;
                const parent_message_struct = JSON.parse(parent_message as string);
                console.log(parent_message);
                bot.sendMessage(parent_message_struct.SUPPORT.FROM_ID as number, tgData.message?.text as string, {reply_to_message_id: parent_message_struct.SUPPORT.MSG_ID});
            } else {
                // message from user
                //if user sent his location?
                if (tgData.message?.location !== undefined) {
                    bot.sendMessage(tgData.message?.chat.id as number, ML('Your location accepted'), {disable_notification: true, reply_markup: {remove_keyboard: true}});
                } else {
                    // this message to support
                    bot.sendMessage(tgData.message?.chat.id as number, strSupportGotYourRequest(lang), {disable_notification: true, reply_markup: {remove_keyboard: true}});
                    for (let istaff = 0; istaff < staff?.length; istaff++ ){
                        const nstaff = parseInt(staff[istaff]);
                        bot.sendMessage(nstaff, `{"SUPPORT":{\n"FROM_ID":${tgData.message?.from?.id},\n"FROM_NAME": "${tgData.message?.from?.first_name}",\n"MSG_ID":${tgData.message?.message_id},\n"MSGTEXT": "${tgData.message?.text}"}}`, {reply_to_message_id: tgData.message?.message_id})
                    }
                }
            }
        }
    }
    return true;
}

async function command_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User | undefined, lang: string, mainKeyboard: KeyboardButton[][]): Promise<boolean> {
    // looking for bot-command from user
    const chat_id = tgData.message?.chat.id as number;
    const commands = tgData.message?.entities?.filter(v => v.type == "bot_command");
    if (!commands || !(commands as any).length ) return false;
    console.log(`command(s) found: ${tgData.message?.text}`);
    for (let [i, c] of Object.entries(commands as Array<TelegramBot.MessageEntity>)) {
        const command_name = tgData.message?.text?.substring(c.offset, c.offset + c.length);
        console.log(`${colours.fg.green}Processing command = '${command_name}'${colours.reset}`);
        switch (command_name) {
            case '/start': 
                if (user){
                    bot.sendMessage(chat_id, tgWelcome(lang, chat_id), {reply_markup: {keyboard: mainKeyboard}});
                } else {
                    const user = new User(undefined, {
                        tguserid: tgData.message?.from?.id as number,
                        nativelanguage: tgData.message?.from?.language_code,
                        blocked: false,
                        created: new Date()
                    });
                    await user.save();
                    bot.sendMessage(chat_id, tgWelcome(lang, tgData.message?.from?.id as number), {reply_markup: {keyboard: mainKeyboard}});

                    const staff = process.env.help_support_staff?.split(',');
                    if (staff !== undefined) {
                        for (let istaff = 0; istaff < staff?.length; istaff++ ){
                            const nstaff = parseInt(staff[istaff]);
                            bot.sendMessage(nstaff, `New user id:'${tgData.message?.chat.id}' name:'${tgData.message?.from?.username}' text: '${tgData.message?.text}'`)
                        }
                    }
                }
            break;

            case '/assign':
                const sp = tgData.message?.text?.split(' ');
                if (!sp || sp?.length != 3) {
                    bot.sendMessage(chat_id as number, `ASSIGN command format: /assign <group_name> <userid>`, {disable_notification: true});
                } else {
                    console.log(`User ${user?.uid} wants to assign group '${sp[1]}' to user '${sp[2]}'`);
                    const assign_user = parseInt(sp[2])?User.getUserByTgUserId(parseInt(sp[2])):undefined;
                    if (!assign_user) {
                        bot.sendMessage(chat_id as number, `User #${sp[2]} not found`, {disable_notification: true});
                    } else {
                        bot.sendMessage(parseInt(sp[2]), invitation_to_assign(user?.json?.nativelanguage as string, tgData.message?.from, sp[1]), tg_bot_accept_group(lang, sp[1], tgData.message?.from));
                    }
                }
            break;

            case '/help':
                if (process.env.help_support_staff !== undefined) {
                    bot.sendMessage(chat_id as number, strSupportInvitation(user?.json?.nativelanguage as string));
                }
            break;

            default: 
                bot.sendMessage(chat_id, `'${command_name}' is unknoun command. Check spelling`);
                return false;
        }
    }
    return true;
}

const tgWelcome = (lang: string, userid: number)=>{
    switch(lang){
        case 'uk': return `Ласкаво просимо! Цей бот допомагає динамічно оцінити вашу психологічну стійкість. Також це дозволяє вам знайти людей зі схожим мисленням. Ми поважаємо вашу конфіденційність. Будьте впевнені, що ми видалимо всі ваші дані у будь-який час на ваш запит. Ваш ID=${userid}. Повідомте його, хто підготував для Вас контент для оцінки`;
        case 'ru': return `Добро пожаловать! Этот бот помогает динамически оценить вашу психологическую устойчивость. Также он позволяет вам найти людей со схожим мышлением. Мы уважаем вашу конфиденциальность. Будьте уверены, что мы удалим все ваши данные в любое время по вашему запросу\nВаш ID=${userid}. Сообщите его тому, кто подготовил для Вас контент для оценки`;
        case 'es': return `¡Bienvenido! Este bot te ayuda a evaluar dinámicamente tu resiliencia mental. También te permite encontrar personas con mentalidades similares. Respetamos tu privacidad. Tenga la seguridad de que eliminaremos todos sus datos en cualquier momento si lo solicita. Tu identificación = ${userid}. Cuéntaselo a la persona que preparó el contenido para que lo evalúes`;
        case 'de': return `Willkommen zurück! Dieser Bot hilft Ihnen, Ihre mentale Belastbarkeit dynamisch einzuschätzen. Es ermöglicht Ihnen auch, Menschen mit ähnlichen Denkweisen zu finden. Wir respektieren deine Privatsphäre. Seien Sie versichert, dass wir alle Ihre Daten jederzeit auf Ihren Wunsch löschen werden. Ihre ID = ${userid}. Teilen Sie es der Person mit, die den Inhalt für Sie zur Bewertung vorbereitet hat`;
        case 'en':
        default:
            return `Welcome! This bot helps evaluate you psychology sustainability  dynamically. Also it provides you finding people with similar mindset. We respect your privacy. Be sure that we'll delete all your data at any moment you request. Your ID is ${userid}.`;
    }
}

const strSupportInvitation = (lang: string)=>{
    switch(lang){
        case 'uk': return `Якщо у вас виникають проблеми з використанням бота, просто напишіть повідомлення боту.`;
        case 'ru': return `Если у Вас есть проблемы при использовании бота, то просто напишите сообщение в бот.`;
        case 'es': return `Si tiene problemas para usar el bot, simplemente escriba un mensaje al bot.`;
        case 'de': return `Solltest du Probleme bei der Nutzung des Bots haben, dann schreib einfach eine Nachricht an den Bot.`;
        case 'en':
        default:
            return `If you have problems using the bot, then simply write a message to the bot.`;
    }
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

function menuSetName(bot: TelegramBot, chat_id: number, user: User){
    function strChooseNameSource(lang: string){
        switch(lang) {
            case 'de': return 'Wählen Sie die Namensquelle';
            case 'es': return 'Elige la fuente del nombre';
            case 'ru': return 'Выберите, откуда взять имя';
            case 'uk': return 'Виберіть джерело імені';
            case 'en':
            default: return 'Choose name source';
        }
    }
    bot.sendMessage(chat_id, strChooseNameSource(user.json?.nativelanguage as string), tg_bot_select_name_menu(user.json?.nativelanguage as string));
}

function menuSetStudyGroup(bot: TelegramBot, chat_id: number, user: User){
    function strChooseNameSource(lang: string){
        switch(lang) {
            case 'de': return 'Wählen Sie Ihre Lerngruppe';
            case 'es': return 'Elige tu grupo de estudio';
            case 'ru': return 'Выберите свою группу';
            case 'uk': return 'Виберіть свою навчальну групу';
            case 'en':
            default: return 'Choose your study group';
        }
    }
    bot.sendMessage(chat_id, strChooseNameSource(user.json?.nativelanguage as string), tg_bot_set_studygroup);
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

function strSupportGotYourRequest (lang: string) {
    switch(lang) {
        case 'de': return 'Unser Supportteam hat Ihre Anfrage erhalten und wird in Kürze antworten.';
        case 'es': return 'Nuestro equipo de soporte ha recibido su solicitud y responderá en breve.';
        case 'ru': return 'Сотрудники поддержки получили Ваше обращение и скоро ответят';
        case 'uk': return 'Наша служба підтримки отримала ваш запит і незабаром відповість.';
        case 'en':
        default: return 'Our support team has received your request and will respond shortly.';
    }
}
