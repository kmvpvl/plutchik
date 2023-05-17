"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webapp = void 0;
const colours_1 = __importDefault(require("../model/colours"));
const organization_1 = __importStar(require("../model/organization"));
const plutchikproto_1 = __importStar(require("../model/plutchikproto"));
const content_1 = __importStar(require("../model/content"));
const user_1 = __importStar(require("../model/user"));
const googleapis_1 = require("googleapis");
const mongoose_1 = require("mongoose");
const assess_new_content = new Map([
    ['en', 'Assess new content'],
    ['uk', 'Оцінити емоції'],
    ['ru', 'Оценить ещё'],
    ['es', 'Evaluar emociones'],
    ['de', 'Emotionen bewerten']
]);
function insights(lang) {
    switch (lang) {
        case 'de': return 'Einblicke';
        case 'es': return 'Perspectivas';
        case 'ru': return 'Инсайты';
        case 'uk': return 'Інсайти';
        case 'en':
        default: return 'Insights';
    }
}
const my_settings = new Map([
    ['en', 'My settings'],
    ['uk', 'Мої налаштування'],
    ['ru', 'Мои настройки'],
    ['es', 'Mi configuración'],
    ['de', 'Meine Einstellungen']
]);
const set_language = new Map([
    ['en', 'Set language'],
    ['uk', 'Встановити мову'],
    ['ru', 'Установить язык'],
    ['es', 'Elegir lenguaje'],
    ['de', 'Sprache einstellen']
]);
const set_age = new Map([
    ['en', 'Set my age'],
    ['uk', 'Встановити мій вік'],
    ['ru', 'Ввести мой возраст'],
    ['es', 'establecer mi edad'],
    ['de', 'Stellen Sie mein Alter ein']
]);
const choose_language = new Map([
    ['en', 'Choose language'],
    ['uk', 'Виберіть мову'],
    ['ru', 'Выберите язык'],
    ['es', 'Elige lengua'],
    ['de', 'Sprache wählen']
]);
function set_gender(lang) {
    switch (lang) {
        case 'de': return 'Mein Geschlecht';
        case 'es': return 'Mi género';
        case 'ru': return 'Мой пол';
        case 'uk': return 'Моя стать';
        case 'en':
        default: return 'My gender';
    }
}
const language_changed = new Map([
    ['en', 'Language was changed'],
    ['uk', 'Мова змінена'],
    ['ru', 'Язык изменен'],
    ['es', 'Idioma cambiado'],
    ['de', 'Sprache geändert']
]);
const enter_age = new Map([
    ['en', 'Enter your age'],
    ['uk', 'Введіть свій вік'],
    ['ru', 'Введите свой возраст'],
    ['es', 'Introduzca su edad'],
    ['de', 'Gebe Dein Alter ein']
]);
function str_gender_changed(lang) {
    switch (lang) {
        case 'de': return 'Das Geschlecht wurde eingestellt';
        case 'es': return 'Se ha cambiado el género';
        case 'ru': return 'Пол установлен';
        case 'uk': return 'Стать встановлено';
        case 'en':
        default: return 'Gender has been set';
    }
}
function choose_delete_way(lang) {
    switch (lang) {
        case 'de': return 'Wir bedauern sehr, dass Sie uns verlassen. Bitte wählen Sie eine Methode zum Löschen Ihrer Daten';
        case 'es': return 'Lamentamos mucho que nos dejes. Seleccione un método para eliminar sus datos';
        case 'ru': return 'Нам очень жаль, что вы покидаете нас. Пожалуйста, выберите способ удаления ваших данных';
        case 'uk': return 'Нам дуже шкода, що ви залишаєте нас. Будь ласка, виберіть спосіб видалення ваших даних';
        case 'en':
        default: return 'We are very sorry that you are leaving us. Please select a method for deleting your data';
    }
}
function notANumber(lang) {
    switch (lang) {
        case 'de': return 'Das Alter muss eine ganze Zahl sein';
        case 'es': return 'La edad debe ser un número entero.';
        case 'ru': return 'Возраст должен быть целым числом';
        case 'uk': return 'Вік має бути цілим числом';
        case 'en':
        default: return 'The age must be a whole number';
    }
}
function ageSet(lang) {
    switch (lang) {
        case 'de': return 'Das Alter wurde erfolgreich eingestellt';
        case 'es': return 'La edad se ha fijado con éxito';
        case 'ru': return 'Возраст установлен успешно';
        case 'uk': return 'Вік поставив вдало';
        case 'en':
        default: return 'The age has set successfully';
    }
}
function deleteMyAccount(lang) {
    switch (lang) {
        case 'de': return 'mein Konto löschen';
        case 'es': return 'borrar mi cuenta';
        case 'ru': return 'Удалить мои данные';
        case 'uk': return 'видалити мої дані';
        case 'en':
        default: return 'Delete my account';
    }
}
function accountDeleted(lang) {
    switch (lang) {
        case 'de': return 'Ihr Konto wurde erfolgreich gelöscht. Um fortzufahren, geben Sie /start ein';
        case 'es': return 'Su cuenta eliminada con éxito. Para reanudar escriba /start';
        case 'ru': return 'Ваша учетная запись удалена успешно. Чтобы возобновить введите /start';
        case 'uk': return 'Ваш обліковий запис успішно видалено. Щоб відновити, введіть /start';
        case 'en':
        default: return 'Your accaunt deleted successfully. To resume type /start';
    }
}
function userNotFound(lang) {
    switch (lang) {
        case 'de': return 'Entschuldigung, Ihr Konto wurde nicht gefunden. Drücke /start';
        case 'es': return 'Lo sentimos, no se encontró su cuenta. Presiona /start';
        case 'ru': return 'Ваша учетная запись не найдена. Чтобы возобновить введите /start';
        case 'uk': return 'Вибачте, ваш обліковий запис не знайдено. Натисніть /start';
        case 'en':
        default: return 'Sorry, your account not found. Press /start';
    }
}
function deleteMyAccountA(lang) {
    switch (lang) {
        case 'de': return 'Lassen Sie Bewertungen anonym. Nur Konto löschen';
        case 'es': return 'Dejar evaluaciones anónimas. Eliminar cuenta solamente';
        case 'ru': return 'Оценки оставить анонимно. Удалить только учетную запись';
        case 'uk': return 'Залиште оцінки анонімними. Видалити лише обліковий запис';
        case 'en':
        default: return 'Leave assessments anonymous. Delete account only';
    }
}
function deleteMyAccountB(lang) {
    switch (lang) {
        case 'de': return 'Alles löschen';
        case 'es': return 'Eliminar todos';
        case 'ru': return 'Удалить всё';
        case 'uk': return 'Видалити все';
        case 'en':
        default: return 'Delete all';
    }
}
function choose_gender(lang) {
    switch (lang) {
        case 'de': return 'Wählen Sie ein Geschlecht aus der Liste aus';
        case 'es': return 'Seleccione un género de la lista';
        case 'ru': return 'Выберите пол из списка';
        case 'uk': return 'Виберіть ґендер зі списку';
        case 'en':
        default: return 'Select a gender from the list';
    }
}
function invitation_to_assign(lang, from, group) {
    switch (lang) {
        case 'de': return `Sie haben von einem Benutzer eine Einladung erhalten '${group}' , Inhalte zu bewerten ${from === null || from === void 0 ? void 0 : from.first_name} ${from === null || from === void 0 ? void 0 : from.last_name}`;
        case 'es': return `Recibiste una invitación para calificar contenido '${group}' de un usuario  ${from === null || from === void 0 ? void 0 : from.first_name} ${from === null || from === void 0 ? void 0 : from.last_name}`;
        case 'ru': return `Вам пришло приглашение оценить контент '${group}' от пользователя ${from === null || from === void 0 ? void 0 : from.first_name} ${from === null || from === void 0 ? void 0 : from.last_name}`;
        case 'uk': return `Вам надійшло запрошення оцінити контент '${group}' від користувача ${from === null || from === void 0 ? void 0 : from.first_name} ${from === null || from === void 0 ? void 0 : from.last_name}`;
        case 'en':
        default: return `You received an invitation to assess content '${group}' from a user ${from === null || from === void 0 ? void 0 : from.first_name} ${from === null || from === void 0 ? void 0 : from.last_name}`;
    }
}
function accept_invitation(lang) {
    switch (lang) {
        case 'de': return 'Ich nehme an';
        case 'es': return 'Acepto';
        case 'ru': return 'Принимаю приглашение';
        case 'uk': return 'Я приймаю';
        case 'en':
        default: return 'I accept';
    }
}
function decline_invitation(lang) {
    switch (lang) {
        case 'de': return 'ich lehne ab';
        case 'es': return 'renuncio';
        case 'ru': return 'Отклоняю приглашение';
        case 'uk': return 'Я відмовляюся';
        case 'en':
        default: return 'I decline';
    }
}
const tg_bot_accept_group = (lang, groupname, from) => {
    return {
        reply_markup: {
            inline_keyboard: [[
                    { text: accept_invitation(lang),
                        callback_data: `accept_assignment:${groupname}:${from === null || from === void 0 ? void 0 : from.id}`
                    }
                ], [
                    { text: decline_invitation(lang),
                        callback_data: `decline_assignment:${groupname}:${from === null || from === void 0 ? void 0 : from.id}`
                    }
                ]]
        }
    };
};
function tg_bot_start_menu(lang, manage = false) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: assess_new_content.get(lang) ? assess_new_content.get(lang) : assess_new_content.get('en'),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram`
                        }
                    },
                    {
                        text: insights(lang),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram?insights`
                        }
                    }
                ], manage ? [
                    {
                        text: `Content management`,
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram?content`
                        }
                    }
                ] : [], [
                    {
                        text: my_settings.get(lang) ? my_settings.get(lang) : my_settings.get('en'),
                        callback_data: 'settings'
                    }
                ]
            ]
        }
    };
}
;
function tg_bot_set_delete_menu(lang) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: deleteMyAccountA(lang),
                        callback_data: 'delete_my_account_a'
                    }
                ], [
                    {
                        text: deleteMyAccountB(lang),
                        callback_data: 'delete_my_account_b'
                    }
                ]
            ]
        }
    };
}
;
function tg_bot_set_location_menu(lang) {
    return {
        reply_markup: {
            keyboard: [[
                    {
                        text: "Send location",
                        request_location: true
                    },
                    {
                        text: assess_new_content.get(lang) ? assess_new_content.get(lang) : assess_new_content.get('en'),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram`
                        }
                    },
                    {
                        text: insights(lang),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram?insights`
                        }
                    }
                ]]
        }
    };
}
function tg_bot_settings_menu(lang) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: set_language.get(lang) ? set_language.get(lang) : set_language.get('en'),
                        callback_data: 'select_language'
                    }
                    /*,{
                        text: 'Set my location',
                        callback_data: 'set_location'
                    }*/
                    ,
                    {
                        text: set_age.get(lang) ? set_age.get(lang) : set_age.get('en'),
                        callback_data: 'set_age'
                    }
                ], [
                    {
                        text: set_gender(lang),
                        callback_data: 'select_gender'
                    },
                    {
                        text: deleteMyAccount(lang),
                        callback_data: 'delete_account'
                    }
                ],
                [
                    {
                        text: assess_new_content.get(lang) ? assess_new_content.get(lang) : assess_new_content.get('en'),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram`
                        }
                    },
                    {
                        text: insights(lang),
                        web_app: {
                            url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram?insights`
                        }
                    }
                ]
            ]
        }
    };
}
;
const tg_bot_set_language_menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'English',
                    callback_data: 'set_language:en'
                },
                {
                    text: 'Español',
                    callback_data: 'set_language:es'
                },
                {
                    text: 'Deutsch',
                    callback_data: 'set_language:de'
                }
            ], [
                {
                    text: 'Українська',
                    callback_data: 'set_language:uk'
                },
                {
                    text: 'Русский',
                    callback_data: 'set_language:ru'
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
};
function tg_bot_set_gender_menu(lang) {
    function strMale(lang) {
        switch (lang) {
            case 'de': return 'Männlich';
            case 'es': return 'Masculina';
            case 'ru': return 'Мужчина';
            case 'uk': return 'Чоловік';
            case 'en':
            default: return 'Male';
        }
    }
    function strFemale(lang) {
        switch (lang) {
            case 'de': return 'Weiblich';
            case 'es': return 'Femenina';
            case 'ru': return 'Женщина';
            case 'uk': return 'Жінка';
            case 'en':
            default: return 'Female';
        }
    }
    function strOther(lang) {
        switch (lang) {
            case 'de': return 'Anderes Geschlecht';
            case 'es': return 'Otro género';
            case 'ru': return 'Другой';
            case 'uk': return 'Інша стать';
            case 'en':
            default: return 'FemOther genderale';
        }
    }
    return {
        reply_markup: {
            inline_keyboard: [
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
            ]
        }
    };
}
function invitation_accepted(lang) {
    switch (lang) {
        case 'de': return 'Sie haben die Einladung angenommen. Vielen Dank und viel Spaß. Button „Neue Inhalte bewerten“ drücken';
        case 'es': return 'Ha aceptado la invitación. Gracias y disfruta Presiona el botón "Evaluar nuevo contenido"';
        case 'ru': return 'Вы приняли приглашение. Спасибо. Получите удовольствие от процесса оценки. Нажмите кнопку "Оценить еще"';
        case 'uk': return 'Ви прийняли запрошення. Дякую і насолоджуйся. Натисніть кнопку «Оцінити новий контент»';
        case 'en':
        default: return 'You have accepted invitation. Thanks and enjoy. Press button "Assess new content"';
    }
}
function invitation_failed(lang) {
    switch (lang) {
        case 'de': return 'Etwas ist schief gelaufen. Wir beschäftigen uns bereits damit.';
        case 'es': return 'Algo salió mal. Ya estamos lidiando con esto."';
        case 'ru': return 'Что-то пошло не так. МЫ уже разбираемся с этим"';
        case 'uk': return 'Щось пішло не так. Ми вже розуміємо це';
        case 'en':
        default: return 'Something went wrong. We are already dealing with this.';
    }
}
function invitation_declined(lang) {
    switch (lang) {
        case 'de': return 'Ihre Ablehnung wurde akzeptiert';
        case 'es': return 'Su rechazo ha sido aceptado"';
        case 'ru': return 'Ваш отказ принят';
        case 'uk': return 'Ваш отказ принят';
        case 'en':
        default: return 'Your refusal has been accepted';
    }
}
function telegram(c, req, res, bot) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${colours_1.default.fg.green}API: telegram function${colours_1.default.reset}`);
        const tgData = req.body;
        if (tgData.callback_query) {
            try {
                const u = yield getUserByTgUserId(tgData.callback_query.from.id);
                if (!u) {
                    bot.sendMessage((_b = (_a = tgData.callback_query) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.chat.id, userNotFound(tgData.callback_query.from.language_code));
                    return res.status(200).json("User not found");
                }
                console.log(`Callback command '${tgData.callback_query.data}'`);
                // waiting command with : separator, f.e. accept_assign:userid
                // or without :, f.e. settings
                const cbcommand = tgData.callback_query.data ? (_c = tgData.callback_query.data) === null || _c === void 0 ? void 0 : _c.split(':') : '';
                switch (cbcommand[0]) {
                    case 'settings':
                        bot.sendMessage((_e = (_d = tgData.callback_query) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.chat.id, my_settings.get((_f = u === null || u === void 0 ? void 0 : u.json) === null || _f === void 0 ? void 0 : _f.nativelanguage) ? my_settings.get((_g = u === null || u === void 0 ? void 0 : u.json) === null || _g === void 0 ? void 0 : _g.nativelanguage) : my_settings.get('en'), tg_bot_settings_menu((_h = u === null || u === void 0 ? void 0 : u.json) === null || _h === void 0 ? void 0 : _h.nativelanguage));
                        break;
                    case 'select_gender':
                        menuSetGender(bot, (_k = (_j = tgData.callback_query) === null || _j === void 0 ? void 0 : _j.message) === null || _k === void 0 ? void 0 : _k.chat.id, u);
                        break;
                    case 'set_gender':
                        const gender = cbcommand[1];
                        u.setGender(gender);
                        bot.sendMessage((_m = (_l = tgData.callback_query) === null || _l === void 0 ? void 0 : _l.message) === null || _m === void 0 ? void 0 : _m.chat.id, str_gender_changed((_o = u === null || u === void 0 ? void 0 : u.json) === null || _o === void 0 ? void 0 : _o.nativelanguage), tg_bot_start_menu((_p = u === null || u === void 0 ? void 0 : u.json) === null || _p === void 0 ? void 0 : _p.nativelanguage));
                        break;
                    case 'select_language':
                        menuSetLanguage(bot, (_r = (_q = tgData.callback_query) === null || _q === void 0 ? void 0 : _q.message) === null || _r === void 0 ? void 0 : _r.chat.id, u);
                        break;
                    case 'set_language':
                        const lang = cbcommand[1];
                        console.log(`Changing user's language to '${lang}'`);
                        yield (u === null || u === void 0 ? void 0 : u.changeNativeLanguage(lang));
                        bot.sendMessage((_t = (_s = tgData.callback_query) === null || _s === void 0 ? void 0 : _s.message) === null || _t === void 0 ? void 0 : _t.chat.id, language_changed.get(lang) ? language_changed.get(lang) : language_changed.get('en'), tg_bot_start_menu((_u = u === null || u === void 0 ? void 0 : u.json) === null || _u === void 0 ? void 0 : _u.nativelanguage));
                        break;
                    case 'set_age':
                        menuSetAge(bot, (_w = (_v = tgData.callback_query) === null || _v === void 0 ? void 0 : _v.message) === null || _w === void 0 ? void 0 : _w.chat.id, u);
                        break;
                    case 'accept_assignment':
                        console.log(`Accept assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
                        const g = yield (0, content_1.findContentGroup)(cbcommand[1]);
                        const from_user = yield getUserByTgUserId(parseInt(cbcommand[2]));
                        if (from_user && g) {
                            yield u.assignContentGroup(from_user, g);
                            //sending message to psycologist
                            bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} accepted your invitation`);
                            //sending message to patient
                            bot.sendMessage(tgData.callback_query.from.id, invitation_accepted((_x = u === null || u === void 0 ? void 0 : u.json) === null || _x === void 0 ? void 0 : _x.nativelanguage), tg_bot_start_menu((_y = u === null || u === void 0 ? void 0 : u.json) === null || _y === void 0 ? void 0 : _y.nativelanguage));
                        }
                        else {
                            //something was wrong either from_user or content group
                            //sending message to psycologist
                            bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} couldn't accept your invitation. But tried. Group name = '${cbcommand[1]}'`);
                            //sending message to patient
                            bot.sendMessage(tgData.callback_query.from.id, invitation_failed((_z = u === null || u === void 0 ? void 0 : u.json) === null || _z === void 0 ? void 0 : _z.nativelanguage), tg_bot_start_menu((_0 = u === null || u === void 0 ? void 0 : u.json) === null || _0 === void 0 ? void 0 : _0.nativelanguage));
                        }
                        break;
                    case 'decline_assignment':
                        console.log(`Decline assignment to group '${cbcommand[1]}' from user tg_id = '${cbcommand[2]}'`);
                        bot.sendMessage(parseInt(cbcommand[2]), `User ${tgData.callback_query.from.first_name} ${tgData.callback_query.from.last_name} declined your invitation. Group name = '${cbcommand[1]}'`);
                        //sending message to patient
                        bot.sendMessage(tgData.callback_query.from.id, invitation_declined((_1 = u === null || u === void 0 ? void 0 : u.json) === null || _1 === void 0 ? void 0 : _1.nativelanguage), tg_bot_start_menu((_2 = u === null || u === void 0 ? void 0 : u.json) === null || _2 === void 0 ? void 0 : _2.nativelanguage));
                        break;
                    case 'delete_account':
                        menuDeleteAccount(bot, (_4 = (_3 = tgData.callback_query) === null || _3 === void 0 ? void 0 : _3.message) === null || _4 === void 0 ? void 0 : _4.chat.id, u);
                        break;
                    case 'delete_my_account_a':
                    case 'delete_my_account_b':
                        yield u.deleteTgUser();
                        bot.sendMessage((_6 = (_5 = tgData.callback_query) === null || _5 === void 0 ? void 0 : _5.message) === null || _6 === void 0 ? void 0 : _6.chat.id, accountDeleted((_7 = u === null || u === void 0 ? void 0 : u.json) === null || _7 === void 0 ? void 0 : _7.nativelanguage));
                        break;
                    case 'set_location':
                        bot.sendMessage((_9 = (_8 = tgData.callback_query) === null || _8 === void 0 ? void 0 : _8.message) === null || _9 === void 0 ? void 0 : _9.chat.id, 'get location', tg_bot_set_location_menu((_10 = u === null || u === void 0 ? void 0 : u.json) === null || _10 === void 0 ? void 0 : _10.nativelanguage));
                        break;
                    default: bot.sendMessage((_12 = (_11 = tgData.callback_query) === null || _11 === void 0 ? void 0 : _11.message) === null || _12 === void 0 ? void 0 : _12.chat.id, `Unknown callback command '${tgData.callback_query.data}'`, tg_bot_start_menu((_13 = u === null || u === void 0 ? void 0 : u.json) === null || _13 === void 0 ? void 0 : _13.nativelanguage));
                }
                return res.status(200).json("OK");
            }
            catch (e) {
                return res.status(400).json(e);
            }
        }
        console.log(`${colours_1.default.fg.blue}Telegram userId = '${(_15 = (_14 = tgData.message) === null || _14 === void 0 ? void 0 : _14.from) === null || _15 === void 0 ? void 0 : _15.id}'${colours_1.default.reset}; chat_id = '${(_16 = tgData.message) === null || _16 === void 0 ? void 0 : _16.chat.id}'`);
        const u = yield getUserByTgUserId((_18 = (_17 = tgData.message) === null || _17 === void 0 ? void 0 : _17.from) === null || _18 === void 0 ? void 0 : _18.id);
        if ((_19 = u === null || u === void 0 ? void 0 : u.json) === null || _19 === void 0 ? void 0 : _19.awaitcommanddata) {
            switch ((_20 = u === null || u === void 0 ? void 0 : u.json) === null || _20 === void 0 ? void 0 : _20.awaitcommanddata) {
                case 'set_age':
                    const age = parseInt((_21 = tgData.message) === null || _21 === void 0 ? void 0 : _21.text);
                    if (isNaN(age)) {
                        bot.sendMessage((_22 = tgData.message) === null || _22 === void 0 ? void 0 : _22.chat.id, notANumber((_23 = u === null || u === void 0 ? void 0 : u.json) === null || _23 === void 0 ? void 0 : _23.nativelanguage));
                    }
                    else {
                        yield u.setAge(age);
                        yield u.setAwaitCommandData();
                        bot.sendMessage((_24 = tgData.message) === null || _24 === void 0 ? void 0 : _24.chat.id, ageSet((_25 = u === null || u === void 0 ? void 0 : u.json) === null || _25 === void 0 ? void 0 : _25.nativelanguage), tg_bot_start_menu((_26 = u === null || u === void 0 ? void 0 : u.json) === null || _26 === void 0 ? void 0 : _26.nativelanguage));
                    }
                    return res.status(200).json("OK");
                    break;
                default:
                    yield u.setAwaitCommandData();
                    return res.status(200).json("OK");
            }
        }
        try {
            if (!(yield processCommands(bot, tgData))
                && !(yield processURLs(bot, tgData))) {
                bot.sendMessage((_27 = tgData.message) === null || _27 === void 0 ? void 0 : _27.chat.id, `Sorry, i couldn't apply this content. Check spelling`);
            }
            ;
            return res.status(200).json("OK");
        }
        catch (e) {
            return res.status(400).json(e);
        }
    });
}
exports.default = telegram;
function webapp(c, req, res, bot) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${colours_1.default.fg.green}API: telegram webapp${colours_1.default.reset}`);
        let user;
        try {
            if (req.query['command']) {
                switch (req.query['command']) {
                    case 'getnext':
                        user = yield getUserByTgUserId(parseInt(req.query['tg_user_id']));
                        if (user) {
                            const org = new organization_1.default((_a = user.json) === null || _a === void 0 ? void 0 : _a.organizationid);
                            yield org.load();
                            const st = yield org.checkAndUpdateSessionToken((_b = user.json) === null || _b === void 0 ? void 0 : _b._id, ["create_assessment"]);
                            const ci = yield user.nextContentItem(bot, (_c = user.json) === null || _c === void 0 ? void 0 : _c.nativelanguage);
                            return res.status(200).json({ result: 'OK', content: ci, user: user.json, sessiontoken: st });
                        }
                        else {
                            return res.status(404).json({ result: 'FAIL', description: 'User not found' });
                        }
                        break;
                    case 'observe':
                        user = yield getUserByTgUserId(parseInt(req.query['tg_user_id']));
                        if (user) {
                            const org = new organization_1.default((_d = user.json) === null || _d === void 0 ? void 0 : _d.organizationid);
                            yield org.load();
                            const ob = yield user.observeAssessments();
                            return res.status(200).json({ observe: ob, user: user.json });
                        }
                        break;
                    case 'manage_content':
                        user = yield getUserByTgUserId(parseInt(req.query['tg_user_id']));
                        if (user) {
                            const org = new organization_1.default((_e = user.json) === null || _e === void 0 ? void 0 : _e.organizationid);
                            yield org.load();
                            const letters = yield org.getFirstLettersOfContentItems();
                            const st = yield org.checkAndUpdateSessionToken((_f = user.json) === null || _f === void 0 ? void 0 : _f._id, ["manage_content"]);
                            const ci = yield org.getContentItems();
                            return res.status(200).json({ org: org.json, user: user.json, letters: letters, items: ci, sessiontoken: st });
                        }
                        break;
                    default:
                        return res.status(404).json({ result: 'FAIL', description: 'Unknown command' });
                }
                return res.status(200).json('OK');
            }
            else if (req.query['insights'] === '')
                return res.sendFile("insights.htm", { root: __dirname });
            else if (req.query['content'] === '')
                return res.sendFile("content.htm", { root: __dirname });
            else
                return res.sendFile("assess.htm", { root: __dirname });
        }
        catch (e) {
            switch (e.code) {
                case "user:nonextcontent":
                    if (user)
                        e.user = user.json;
                    return res.status(404).json(e);
                default:
                    return res.status(400).json(e);
            }
        }
    });
}
exports.webapp = webapp;
function getUserByTgUserId(tg_user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        plutchikproto_1.default.connectMongo();
        const ou = yield user_1.mongoUsers.aggregate([{
                '$match': {
                    'tguserid': tg_user_id,
                    'blocked': false
                }
            }]);
        if (ou.length)
            return new user_1.default(undefined, ou[0]);
    });
}
const tgWelcome = (lang, userid) => {
    switch (lang) {
        case 'uk': return 'Ласкаво просимо! Цей бот допомагає динамічно оцінити вашу психологічну стійкість. Також це дозволяє вам знайти людей зі схожим мисленням. Ми поважаємо вашу конфіденційність. Будьте впевнені, що ми видалимо всі ваші дані у будь-який час на ваш запит';
        case 'ru': return `Добро пожаловать! Этот бот помогает динамически оценить вашу психологическую устойчивость. Также он позволяет вам найти людей со схожим мышлением. Мы уважаем вашу конфиденциальность. Будьте уверены, что мы удалим все ваши данные в любое время по вашему запросу\nВаш ID=${userid}. Сообщите его тому, кто подготовил для Вас контент для оценки`;
        case 'es': return '¡Bienvenido! Este bot te ayuda a evaluar dinámicamente tu resiliencia mental. También te permite encontrar personas con mentalidades similares. Respetamos tu privacidad. Tenga la seguridad de que eliminaremos todos sus datos en cualquier momento si lo solicita.';
        case 'de': return 'Willkommen zurück! Dieser Bot hilft Ihnen, Ihre mentale Belastbarkeit dynamisch einzuschätzen. Es ermöglicht Ihnen auch, Menschen mit ähnlichen Denkweisen zu finden. Wir respektieren deine Privatsphäre. Seien Sie versichert, dass wir alle Ihre Daten jederzeit auf Ihren Wunsch löschen werden.';
        case 'en':
        default:
            return `Welcome! This bot helps evaluate you psycology sustainability  dynamically. Also it provides you finding people with similar mindset. We respect your privacy. Be sure that we'll delete all your data at any moment you request`;
    }
};
function processCommands(bot, tgData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
    return __awaiter(this, void 0, void 0, function* () {
        // looking for bot-command from user
        const commands = (_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.entities) === null || _b === void 0 ? void 0 : _b.filter(v => v.type == "bot_command");
        if (!commands || !commands.length)
            return false;
        console.log(`command(s) found: ${(_c = tgData.message) === null || _c === void 0 ? void 0 : _c.text}`);
        for (let [i, c] of Object.entries(commands)) {
            const command_name = (_e = (_d = tgData.message) === null || _d === void 0 ? void 0 : _d.text) === null || _e === void 0 ? void 0 : _e.substring(c.offset, c.offset + c.length);
            console.log(`${colours_1.default.fg.green}Processing command = '${command_name}'${colours_1.default.reset}`);
            const u = yield getUserByTgUserId((_g = (_f = tgData.message) === null || _f === void 0 ? void 0 : _f.from) === null || _g === void 0 ? void 0 : _g.id);
            switch (command_name) {
                case '/start':
                    if (u) {
                        //
                        const org = new organization_1.default((_h = u.json) === null || _h === void 0 ? void 0 : _h.organizationid);
                        yield org.load();
                        let isContentManageRole = false;
                        try {
                            const key = yield org.checkTgUserId((_k = (_j = tgData.message) === null || _j === void 0 ? void 0 : _j.from) === null || _k === void 0 ? void 0 : _k.id);
                            isContentManageRole = organization_1.default.checkRoles(key.roles, "manage_content");
                        }
                        catch (e) {
                            isContentManageRole = false;
                        }
                        bot.sendMessage((_l = tgData.message) === null || _l === void 0 ? void 0 : _l.chat.id, tgWelcome((_m = u.json) === null || _m === void 0 ? void 0 : _m.nativelanguage, (_p = (_o = tgData.message) === null || _o === void 0 ? void 0 : _o.from) === null || _p === void 0 ? void 0 : _p.id), tg_bot_start_menu((_q = u.json) === null || _q === void 0 ? void 0 : _q.nativelanguage, isContentManageRole));
                    }
                    else {
                        const user = new user_1.default(undefined, {
                            organizationid: new mongoose_1.Types.ObjectId('63c0e7dad80176886c22129d'),
                            tguserid: (_s = (_r = tgData.message) === null || _r === void 0 ? void 0 : _r.from) === null || _s === void 0 ? void 0 : _s.id,
                            nativelanguage: (_u = (_t = tgData.message) === null || _t === void 0 ? void 0 : _t.from) === null || _u === void 0 ? void 0 : _u.language_code,
                            blocked: false,
                            created: new Date()
                        });
                        yield user.save();
                        bot.sendMessage((_v = tgData.message) === null || _v === void 0 ? void 0 : _v.chat.id, tgWelcome((_w = user.json) === null || _w === void 0 ? void 0 : _w.nativelanguage, (_y = (_x = tgData.message) === null || _x === void 0 ? void 0 : _x.from) === null || _y === void 0 ? void 0 : _y.id), tg_bot_start_menu((_z = user.json) === null || _z === void 0 ? void 0 : _z.nativelanguage));
                    }
                    break;
                case '/assign':
                    const sp = (_1 = (_0 = tgData.message) === null || _0 === void 0 ? void 0 : _0.text) === null || _1 === void 0 ? void 0 : _1.split(' ');
                    if (!sp || (sp === null || sp === void 0 ? void 0 : sp.length) != 3) {
                        bot.sendMessage((_2 = tgData.message) === null || _2 === void 0 ? void 0 : _2.chat.id, `ASSIGN command format: /assign <group_name> <userid>`, { disable_notification: true });
                    }
                    else {
                        console.log(`User ${u === null || u === void 0 ? void 0 : u.uid} wants to assign group '${sp[1]}' to user '${sp[2]}'`);
                        const assign_user = parseInt(sp[2]) ? getUserByTgUserId(parseInt(sp[2])) : undefined;
                        if (!assign_user) {
                            bot.sendMessage((_3 = tgData.message) === null || _3 === void 0 ? void 0 : _3.chat.id, `User #${sp[2]} not found`, { disable_notification: true });
                        }
                        else {
                            bot.sendMessage(parseInt(sp[2]), invitation_to_assign((_4 = u === null || u === void 0 ? void 0 : u.json) === null || _4 === void 0 ? void 0 : _4.nativelanguage, (_5 = tgData.message) === null || _5 === void 0 ? void 0 : _5.from, sp[1]), tg_bot_accept_group((_6 = u === null || u === void 0 ? void 0 : u.json) === null || _6 === void 0 ? void 0 : _6.nativelanguage, sp[1], (_7 = tgData.message) === null || _7 === void 0 ? void 0 : _7.from));
                        }
                    }
                    break;
                case '/set_language':
                    menuSetLanguage(bot, (_8 = tgData.message) === null || _8 === void 0 ? void 0 : _8.chat.id, u);
                    break;
                default:
                    bot.sendMessage((_9 = tgData.message) === null || _9 === void 0 ? void 0 : _9.chat.id, `'${command_name}' is unknoun command. Check spelling`);
                    return false;
            }
        }
        return true;
    });
}
function yt_id(url) {
    if (!url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/))
        return undefined;
    const r = url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
    return r ? r[1] : undefined;
}
function menuSetLanguage(bot, chat_id, user) {
    var _a, _b;
    bot.sendMessage(chat_id, choose_language.get((_a = user.json) === null || _a === void 0 ? void 0 : _a.nativelanguage) ? choose_language.get((_b = user.json) === null || _b === void 0 ? void 0 : _b.nativelanguage) : choose_language.get('en'), tg_bot_set_language_menu);
}
function menuSetAge(bot, chat_id, user) {
    var _a, _b;
    bot.sendMessage(chat_id, enter_age.get((_a = user.json) === null || _a === void 0 ? void 0 : _a.nativelanguage) ? enter_age.get((_b = user.json) === null || _b === void 0 ? void 0 : _b.nativelanguage) : enter_age.get('en'));
    user.setAwaitCommandData("set_age");
}
function menuSetGender(bot, chat_id, user) {
    var _a, _b;
    bot.sendMessage(chat_id, choose_gender((_a = user.json) === null || _a === void 0 ? void 0 : _a.nativelanguage), tg_bot_set_gender_menu((_b = user.json) === null || _b === void 0 ? void 0 : _b.nativelanguage));
}
function menuDeleteAccount(bot, chat_id, user) {
    var _a, _b;
    bot.sendMessage(chat_id, choose_delete_way((_a = user.json) === null || _a === void 0 ? void 0 : _a.nativelanguage), tg_bot_set_delete_menu((_b = user.json) === null || _b === void 0 ? void 0 : _b.nativelanguage));
}
function yt_video_data(yt_video_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log();
            const youtube = googleapis_1.google.youtube({
                version: "v3",
                auth: plutchikproto_1.settings.yt_API_KEY,
            });
            const d = yield youtube.videos.list({
                part: ['snippet'],
                id: [yt_video_id],
            });
            return d;
        }
        catch (e) {
            console.log(`${colours_1.default.fg.red}YoutubeAPI error. API_KEY = '${plutchikproto_1.settings.yt_API_KEY}'; error = '${e}'${colours_1.default.reset}`);
        }
    });
}
function processURLs(bot, tgData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function* () {
        // looking for URL
        let org = yield getOrganizationByTgUser(bot, tgData);
        const media_props = (_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.split(':');
        const media_type = media_props ? media_props[0] : undefined;
        const media_lang = media_props ? media_props[1] : undefined;
        const media_name = media_props ? media_props[2] : undefined;
        const media_desc = media_props ? media_props[3] : undefined;
        const URLs = (_d = (_c = tgData.message) === null || _c === void 0 ? void 0 : _c.entities) === null || _d === void 0 ? void 0 : _d.filter(v => v.type == "url");
        if (!URLs || !URLs.length) {
            switch (media_type) {
                case 'text':
                    console.log(`Text found: Name = '${media_name}', lang = '${media_lang}'`);
                    if (org) {
                        let ic = {
                            organizationid: (_e = org.json) === null || _e === void 0 ? void 0 : _e._id,
                            type: "text",
                            source: "embedded",
                            name: media_name,
                            tags: [],
                            tgData: tgData,
                            description: media_desc,
                            language: media_lang,
                            blocked: false,
                            created: new Date(),
                            restrictions: []
                        };
                        if (!ic.language)
                            ic.language = 'en';
                        let content = new content_1.default(undefined, ic);
                        yield content.save();
                        const msg = `New content added`;
                        bot.sendMessage((_f = tgData.message) === null || _f === void 0 ? void 0 : _f.chat.id, msg, { disable_notification: true });
                    }
                    return true;
                default:
                    return false;
            }
        }
        console.log(`url(s) found: ${(_g = tgData.message) === null || _g === void 0 ? void 0 : _g.text}`);
        for (let [i, u] of Object.entries(URLs)) {
            const url_name = (_j = (_h = tgData.message) === null || _h === void 0 ? void 0 : _h.text) === null || _j === void 0 ? void 0 : _j.substring(u.offset, u.offset + u.length);
            console.log(`${colours_1.default.fg.green}Processing URL = '${url_name}'${colours_1.default.reset}`);
            switch (media_type) {
                case 'img':
                    console.log(`Image found: Name = '${media_name}', lang = '${media_lang}'`);
                    if (org) {
                        let ic = {
                            organizationid: (_k = org.json) === null || _k === void 0 ? void 0 : _k._id,
                            url: url_name,
                            type: "image",
                            source: "web",
                            name: media_name,
                            tgData: tgData,
                            tags: [],
                            description: media_desc,
                            language: media_lang,
                            blocked: false,
                            created: new Date(),
                            restrictions: []
                        };
                        if (!ic.language)
                            ic.language = 'en';
                        let content = new content_1.default(undefined, ic);
                        yield content.save();
                        const msg = `New content added`;
                        bot.sendMessage((_l = tgData.message) === null || _l === void 0 ? void 0 : _l.chat.id, msg, { disable_notification: true });
                    }
                    break;
                default:
                    const ytId = yt_id(url_name);
                    if (ytId) {
                        console.log(`YOUTUBE content found: videoId = '${ytId}'`);
                        const data = (yield yt_video_data(ytId)).data;
                        // !! need error handling
                        //console.log(data.items);
                        if (org) {
                            for (let [i, ytVi] of Object.entries(data.items)) {
                                let snippet = ytVi.snippet;
                                console.log(`Title: '${snippet.title}', tags: '${snippet.tags}'`);
                                let ic = {
                                    organizationid: (_m = org.json) === null || _m === void 0 ? void 0 : _m._id,
                                    url: url_name,
                                    type: "video",
                                    source: "youtube",
                                    name: snippet.title,
                                    tags: snippet.tags,
                                    description: snippet.description,
                                    language: snippet.defaultAudioLanguage,
                                    tgData: tgData,
                                    blocked: false,
                                    created: new Date(),
                                    restrictions: []
                                };
                                if (!ic.language)
                                    ic.language = 'en';
                                let content = new content_1.default(undefined, ic);
                                yield content.save();
                                const msg = `New content added`;
                                bot.sendMessage((_o = tgData.message) === null || _o === void 0 ? void 0 : _o.chat.id, msg, { disable_notification: true });
                            }
                        }
                        else {
                            const msg = `Role 'manage_content' expected`;
                            bot.sendMessage((_p = tgData.message) === null || _p === void 0 ? void 0 : _p.chat.id, msg);
                        }
                    }
                    else {
                        console.log(`Couldn't recognize known domain: ${url_name}`);
                    }
            }
        }
        return true;
    });
}
function processMedia(bot, tgData) {
    return __awaiter(this, void 0, void 0, function* () {
        return false;
    });
}
function getOrganizationByTgUser(bot, tgData) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        plutchikproto_1.default.connectMongo();
        const perms = yield organization_1.mongoOrgs.aggregate([
            {
                "$match": {
                    "keys.tgUserId": (_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.id
                }
            }
        ]);
        let org;
        console.log(`Organization keys found for user:`);
        for (const i in perms) {
            org = new organization_1.default(undefined, perms[i]);
            const ikey = yield org.checkTgUserId((_d = (_c = tgData.message) === null || _c === void 0 ? void 0 : _c.from) === null || _d === void 0 ? void 0 : _d.id);
            console.log(`${colours_1.default.fg.blue}found: organizationid = '${perms[i]._id}'; roles = '${ikey.roles}'${colours_1.default.reset}`);
            if (organization_1.default.checkRoles(ikey.roles, "manage_content")) {
                return org;
            }
        }
        return;
    });
}
