import { Request, Response } from 'express';
import PlutchikError, { ErrorCode } from '../model/error';
import colours from "../model/colours";
import TelegramBot, { InlineKeyboardButton} from 'node-telegram-bot-api';
import Organization, { IOrganization, IResponseToInvitation, mongoOrgs } from '../model/organization';
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

function tg_bot_settings_menu(lang: string, user: User, MainKeyboardMenu: InlineKeyboardButton[][]):TelegramBot.SendMessageOptions {
    const age = user.json?.birthdate? new Date().getFullYear() - user.json?.birthdate.getFullYear():'??';
    let gender = '??';
    switch(user.json?.gender) {
        case 'male': gender = ML('Male', lang);
            break;
        case 'female': gender = ML('Female', lang);
        break;
        case 'other': gender = ML('Their', lang);
            break;
        default: gender = '??';
    }
    let location = '??';
    if (user.json?.location?.coords !== undefined) location = '✔️';//JSON.stringify(user.json?.location?.coords);
    if (user.json?.location?.country !== undefined) location = user.json?.location?.country;
    const fullMenu: InlineKeyboardButton[][] = [[
        {text: `${ML('My name', lang)}: ${user.json?.name?user.json?.name:'??'}`, callback_data: 'select_name'}
    ],[
        {text: set_language.get(lang)?set_language.get(lang) as string:set_language.get('en') as string, callback_data: 'select_language'},
        {text: `${set_age(lang)}: ${age}`, callback_data: 'set_age'}
    ],[
        {text: `${ML('Share my location', lang)}: ${location}`, callback_data: 'share_location'}
    ], [
        {text: `${set_gender(lang)}: ${gender}`, callback_data: 'select_gender'},
        {text: deleteMyAccount(lang), callback_data: 'delete_account'}
    ]];
    //fullMenu.push(...MainKeyboardMenu); 
    return { disable_notification: true,
        reply_markup: {inline_keyboard: fullMenu}
    }
};

const tg_bot_set_language_menu:TelegramBot.SendMessageOptions = {
    reply_markup: {
        inline_keyboard:[[
                {text: 'English', callback_data: 'set_language:en'}
                ,{text: 'Español', callback_data: 'set_language:es'}
                ,{text: 'Deutsch', callback_data: 'set_language:de'}
            ], [
                {text: 'Українська', callback_data: 'set_language:uk'}
                ,{text: 'Русский', callback_data: 'set_language:ru'}
            ] ,[
                {text: 'My settings', callback_data: 'settings'}
            ]]
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
        const MainKeyboardMenu: InlineKeyboardButton[][] = [[
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

async function callback_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User, ulang: string, mainKeyboard: InlineKeyboardButton[][]): Promise<boolean> {
    const callback = tgData.callback_query?.data as string;
    const chat_id = tgData.callback_query?.message?.chat.id as number;
    console.log(`Callback command '${callback}'`);
    // waiting command with : separator, f.e. accept_assign:userid
    // or without :, f.e. settings
    const cbcommand = callback.split(':');
    switch(cbcommand[0]) {
        case 'settings':
            bot.sendMessage(chat_id, ML('Here\'s what we know about you so far', ulang), tg_bot_settings_menu(ulang, user, mainKeyboard));
            break;
        case 'select_gender':
            bot.sendMessage(chat_id, choose_gender(user.json?.nativelanguage as string), {reply_markup: {inline_keyboard:[[
                {text: ML('Male', ulang), callback_data: 'set_gender:male'},
                {text: ML('Female', ulang), callback_data: 'set_gender:female'}
            ],[
                {text: ML('Their', ulang), callback_data: 'set_gender:other'}
            ]]}});
            break;
        case 'set_gender':
            const gender = cbcommand[1];
            await user.setGender(gender);
            bot.sendMessage(chat_id as number, str_gender_changed(ulang), {disable_notification: true, reply_markup:{inline_keyboard: mainKeyboard}});
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
            bot.sendMessage(chat_id, ML('Your name\'s been changed', ulang as string), tg_bot_settings_menu(ulang, user, mainKeyboard));
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

        case 'decline_org':
        case 'accept_org':
            const inv_id = new Types.ObjectId(cbcommand[1]);
            const acceptordecline = cbcommand[0]==='accept_org';
            if (acceptordecline)
                console.log(`Accept assignment to org '${inv_id}'`);
            else 
                console.log(`Decline assignment to org '${inv_id}'`);
            // need to:
            try {
                const org = await Organization.getOrganizationByInvitationId(inv_id);
                console.log(`${colours.fg.blue}Organization id found '${org.uid}'${colours.reset}`);
                const invitation = org.json?.invitations?.filter(v=>inv_id.equals(v._id));
                if (invitation === undefined || invitation.length ===0 || invitation.length > 1) throw new PlutchikError("organization:broken", `Could not find invitation  id = '${inv_id}' in org id = '${org.uid}'`)
                // send message to user
                if (acceptordecline){
                    bot.sendMessage(chat_id, ML("Now you can assess new content. The assigned sets have priority and be proposed first. When you assess all assigned item we'll text to author of set"), {reply_markup: {inline_keyboard: mainKeyboard}})
                } else { 
                    bot.sendMessage(chat_id, ML("You declined the invitation"), {reply_markup: {inline_keyboard: mainKeyboard}})
                }
                // send message to orgs author
                if (acceptordecline)
                    bot.sendMessage(invitation[0].from_tguserid, `${ML("User")} ${user.json?.name?user.json?.name:''}(${user.json?.tguserid}) ${ML("has accepted your invitation to set ")} ${org.json?.name}`);
                else
                    bot.sendMessage(invitation[0].from_tguserid, `${ML("User")} ${user.json?.name?user.json?.name:''}(${user.json?.tguserid}) ${ML("has declined your invitation to set ")} ${org.json?.name}`);
                // save Update to org answers as evidence
                const answer: IResponseToInvitation = {
                    _id: new Types.ObjectId(),
                    response_to: inv_id,
                    acceptordecline: acceptordecline,
                    user_reply: tgData,
                    created: new Date()
                }
                org.logResponseToInvitation(answer);

                // add org to user tasks to do
                if (acceptordecline)
                    await user.assignContentOrg(answer._id, invitation[0].from_tguserid, org);

                await org.save();
        } catch (e: any) {
                console.log(`${colours.fg.red}${e.message}${colours.reset}`);
                // send message to user about error
                bot.sendMessage(chat_id, ML("Invitation expired and couldn't be use anymore. Ask your contact invite you again"), {disable_notification: true});
            }
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
            await user.setAwaitCommandData('share_real_location');
            bot.sendMessage(chat_id as number, ML('Press button to share you location', ulang), 
            {disable_notification: true, reply_markup:{keyboard:[[{text: ML('Press button to share you location', ulang), request_location: true}]], one_time_keyboard: true}});
            break;

        case 'share_country_location':
            await user.setAwaitCommandData('share_country_location');
            bot.sendMessage(chat_id as number, ML('Type your place where you live', ulang), 
            {disable_notification: true});
            break;

        case 'hide_location':
            await user.setLocation();
            bot.sendMessage(chat_id as number, ML('Your location hidden', ulang), 
            {disable_notification: true, reply_markup: {inline_keyboard: mainKeyboard, remove_keyboard: true}});
            break;
        default: bot.sendMessage(chat_id as number, `Unknown callback command '${tgData.callback_query?.data}'`);
    }
    return true;
}

async function message_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User, lang: string, mainKeyboard: InlineKeyboardButton[][]): Promise<boolean> {
    const chat_id = tgData.message?.chat.id as number;
    console.log(`${colours.fg.blue}Telegram message processing userId = '${tgData.message?.from?.id}'${colours.reset}; chat_id = '${chat_id}'`);
    // is waiting data from user?
    if (user?.json?.awaitcommanddata !== undefined){
        switch(user.json?.awaitcommanddata) {
            case 'set_age':
                const age = parseInt(tgData.message?.text as string);
                if (isNaN(age)) {
                    bot.sendMessage(tgData.message?.chat.id as number, notANumber(lang));
                } else {
                    await user.setAge(age);
                    await user.setAwaitCommandData();
                    bot.sendMessage(tgData.message?.chat.id as number, ageSet(lang), {disable_notification: true, reply_markup: {inline_keyboard: mainKeyboard, remove_keyboard: true}});
                }
                break;
            
            case 'set_name':
                await user.setName(tgData.message?.text);
                await user.setAwaitCommandData();
                bot.sendMessage(tgData.message?.chat.id as number, ML('Your name\'s been changed', lang), {disable_notification: true, reply_markup: {inline_keyboard: mainKeyboard, remove_keyboard: true}});
                break;
            case 'share_real_location':
            case 'share_country_location':
                //if user sent his location?
                if (tgData.message?.location !== undefined) {
                    user.setLocation({coords: tgData.message?.location});
                    bot.sendMessage(tgData.message?.chat.id as number, ML('Your location accepted', lang), {disable_notification: true, reply_markup: {remove_keyboard: true}});
                } else {
                    user.setLocation({country: tgData.message?.text});
                    bot.sendMessage(tgData.message?.chat.id as number, ML('Your message does not contain real coordinates and accepted as your region or country', lang), {disable_notification: true, reply_markup: {remove_keyboard: true}});
                }
                await user.setAwaitCommandData();
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
                console.log(`${colours.fg.cyan}Reply of support staff to user${colours.reset}`)
                const parent_message = tgData.message?.reply_to_message?.text;
                const parent_message_struct = JSON.parse(parent_message as string);
                console.log(`Original message of user: ${parent_message}, \nreply of support staff: '${tgData.message?.text}'`);
                bot.sendMessage(parent_message_struct.SUPPORT.FROM_ID as number, tgData.message?.text as string, {reply_to_message_id: parent_message_struct.SUPPORT.MSG_ID});
            } else {
                // message from user
                // this message to support
                bot.sendMessage(tgData.message?.chat.id as number, strSupportGotYourRequest(lang), {disable_notification: true, reply_markup: {remove_keyboard: true}});
                for (let istaff = 0; istaff < staff?.length; istaff++ ){
                    const nstaff = parseInt(staff[istaff]);
                    bot.sendMessage(nstaff, `{"SUPPORT":{\n"FROM_ID":${tgData.message?.from?.id},\n"FROM_NAME": "${tgData.message?.from?.first_name}",\n"MSG_ID":${tgData.message?.message_id},\n"MSGTEXT": "${tgData.message?.text}"}}`, {reply_to_message_id: tgData.message?.message_id})
                }
            }
        }
    }
    return true;
}

async function command_process(tgData: TelegramBot.Update, bot: TelegramBot, user: User | undefined, lang: string, mainKeyboard: InlineKeyboardButton[][]): Promise<boolean> {
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
                } else {
                    const user = new User(undefined, {
                        tguserid: tgData.message?.from?.id as number,
                        nativelanguage: tgData.message?.from?.language_code,
                        blocked: false,
                        created: new Date()
                    });
                    await user.save();
                    const staff = process.env.help_support_staff?.split(',');
                    if (staff !== undefined) {
                        for (let istaff = 0; istaff < staff?.length; istaff++ ){
                            const nstaff = parseInt(staff[istaff]);
                            bot.sendMessage(nstaff, `New user id:'${tgData.message?.chat.id}' name:'${tgData.message?.from?.username}' text: '${tgData.message?.text}'`)
                        }
                    }
                }
            case '/home':
                bot.sendMessage(chat_id, `${ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, lang)} (${process.env.landing_url})\n${ML("Your Telegram ID is ")}${chat_id}\n${ML("Use your Telegram ID to create own content sets or to be invited assessing other sets")}`, {disable_notification: true, reply_markup: {inline_keyboard: mainKeyboard}});
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
                    bot.sendMessage(chat_id as number, `${ML(`If you have problems using the bot, then simply write a message to the bot. See details here`, lang)} (${process.env.landing_url})`);
                }
            break;

            default: 
                bot.sendMessage(chat_id, `'${command_name}' is unknoun command. Check spelling`);
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
