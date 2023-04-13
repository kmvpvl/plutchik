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
exports.webapp = exports.onPhoto = void 0;
const colours_1 = __importDefault(require("../model/colours"));
const organization_1 = __importStar(require("../model/organization"));
const plutchikproto_1 = __importStar(require("../model/plutchikproto"));
const content_1 = __importDefault(require("../model/content"));
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
function tg_bot_start_menu(lang) {
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
function tg_bot_settings_menu(lang) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: set_language.get(lang) ? set_language.get(lang) : set_language.get('en'),
                        callback_data: 'set_language'
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
                        text: deleteMyAccount(lang),
                        callback_data: 'delete_account'
                    }
                ],
                [
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
const tg_bot_set_language_menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'English',
                    callback_data: 'set_language_en'
                },
                {
                    text: 'Español',
                    callback_data: 'set_language_es'
                },
                {
                    text: 'Deutsch',
                    callback_data: 'set_language_de'
                }
            ], [
                {
                    text: 'Українська',
                    callback_data: 'set_language_uk'
                },
                {
                    text: 'Русский',
                    callback_data: 'set_language_ru'
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
function telegram(c, req, res, bot) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
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
                switch (tgData.callback_query.data) {
                    case 'settings':
                        bot.sendMessage((_d = (_c = tgData.callback_query) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.chat.id, my_settings.get((_e = u === null || u === void 0 ? void 0 : u.json) === null || _e === void 0 ? void 0 : _e.nativelanguage) ? my_settings.get((_f = u === null || u === void 0 ? void 0 : u.json) === null || _f === void 0 ? void 0 : _f.nativelanguage) : my_settings.get('en'), tg_bot_settings_menu((_g = u === null || u === void 0 ? void 0 : u.json) === null || _g === void 0 ? void 0 : _g.nativelanguage));
                        break;
                    case 'set_language':
                        menuSetLanguage(bot, (_j = (_h = tgData.callback_query) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.chat.id, u);
                        break;
                    case 'set_language_en':
                    case 'set_language_uk':
                    case 'set_language_es':
                    case 'set_language_ru':
                    case 'set_language_de':
                        const lang = tgData.callback_query.data.split('_')[2];
                        console.log(`Changing user's language to '${lang}'`);
                        yield (u === null || u === void 0 ? void 0 : u.changeNativeLanguage(lang));
                        bot.sendMessage((_l = (_k = tgData.callback_query) === null || _k === void 0 ? void 0 : _k.message) === null || _l === void 0 ? void 0 : _l.chat.id, language_changed.get(lang) ? language_changed.get(lang) : language_changed.get('en'), tg_bot_start_menu((_m = u === null || u === void 0 ? void 0 : u.json) === null || _m === void 0 ? void 0 : _m.nativelanguage));
                        break;
                    case 'set_age':
                        menuSetAge(bot, (_p = (_o = tgData.callback_query) === null || _o === void 0 ? void 0 : _o.message) === null || _p === void 0 ? void 0 : _p.chat.id, u);
                        break;
                    case 'delete_account':
                        menuDeleteAccount(bot, (_r = (_q = tgData.callback_query) === null || _q === void 0 ? void 0 : _q.message) === null || _r === void 0 ? void 0 : _r.chat.id, u);
                        break;
                    case 'delete_my_account_a':
                    case 'delete_my_account_b':
                        yield u.deleteTgUser();
                        bot.sendMessage((_t = (_s = tgData.callback_query) === null || _s === void 0 ? void 0 : _s.message) === null || _t === void 0 ? void 0 : _t.chat.id, accountDeleted((_u = u === null || u === void 0 ? void 0 : u.json) === null || _u === void 0 ? void 0 : _u.nativelanguage));
                        break;
                    default: bot.sendMessage((_w = (_v = tgData.callback_query) === null || _v === void 0 ? void 0 : _v.message) === null || _w === void 0 ? void 0 : _w.chat.id, `Unknown callback command '${tgData.callback_query.data}'`, tg_bot_start_menu((_x = u === null || u === void 0 ? void 0 : u.json) === null || _x === void 0 ? void 0 : _x.nativelanguage));
                }
                return res.status(200).json("OK");
            }
            catch (e) {
                return res.status(400).json(e);
            }
        }
        console.log(`${colours_1.default.fg.blue}Telegram userId = '${(_z = (_y = tgData.message) === null || _y === void 0 ? void 0 : _y.from) === null || _z === void 0 ? void 0 : _z.id}'${colours_1.default.reset}; chat_id = '${(_0 = tgData.message) === null || _0 === void 0 ? void 0 : _0.chat.id}'`);
        const u = yield getUserByTgUserId((_2 = (_1 = tgData.message) === null || _1 === void 0 ? void 0 : _1.from) === null || _2 === void 0 ? void 0 : _2.id);
        if ((_3 = u === null || u === void 0 ? void 0 : u.json) === null || _3 === void 0 ? void 0 : _3.awaitcommanddata) {
            switch ((_4 = u === null || u === void 0 ? void 0 : u.json) === null || _4 === void 0 ? void 0 : _4.awaitcommanddata) {
                case 'set_age':
                    const age = parseInt((_5 = tgData.message) === null || _5 === void 0 ? void 0 : _5.text);
                    if (isNaN(age)) {
                        bot.sendMessage((_6 = tgData.message) === null || _6 === void 0 ? void 0 : _6.chat.id, notANumber((_7 = u === null || u === void 0 ? void 0 : u.json) === null || _7 === void 0 ? void 0 : _7.nativelanguage));
                    }
                    else {
                        yield u.setAge(age);
                        yield u.setAwaitCommandData();
                        bot.sendMessage((_8 = tgData.message) === null || _8 === void 0 ? void 0 : _8.chat.id, ageSet((_9 = u === null || u === void 0 ? void 0 : u.json) === null || _9 === void 0 ? void 0 : _9.nativelanguage), tg_bot_start_menu((_10 = u === null || u === void 0 ? void 0 : u.json) === null || _10 === void 0 ? void 0 : _10.nativelanguage));
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
                bot.sendMessage((_11 = tgData.message) === null || _11 === void 0 ? void 0 : _11.chat.id, `Sorry, i couldn't apply this content. Check spelling`);
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
function onPhoto(bot, msg) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const ph = (_a = msg.photo) === null || _a === void 0 ? void 0 : _a.pop();
        if (ph) {
            const filename = yield bot.downloadFile(ph.file_id, "./images/");
            bot.sendMessage(msg.chat.id, `downloaded ${filename}`);
        }
    });
}
exports.onPhoto = onPhoto;
function webapp(c, req, res, bot) {
    var _a, _b, _c;
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
                            const ci = yield user.nextContentItem((_c = user.json) === null || _c === void 0 ? void 0 : _c.nativelanguage);
                            return res.status(200).json({ result: 'OK', content: ci, user: user.json, sessiontoken: st });
                        }
                        else {
                            return res.status(404).json({ result: 'FAIL', description: 'User not found' });
                        }
                        break;
                    default:
                        return res.status(404).json({ result: 'FAIL', description: 'Unknown command' });
                }
                return res.status(200).json('OK');
            }
            else
                return res.sendFile("webapp.htm", { root: __dirname });
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
                    'tguserid': tg_user_id
                }
            }]);
        if (ou.length)
            return new user_1.default(undefined, ou[0]);
    });
}
const tgWelcome = new Map([
    ['en', `Welcome! This bot helps evaluate you psycology sustainability  dynamically. Also it provides you finding people with similar mindset. We respect your privacy. Be sure that we'll delete all your data at any moment you request`],
    ['uk', 'Ласкаво просимо! Цей бот допомагає динамічно оцінити вашу психологічну стійкість. Також це дозволяє вам знайти людей зі схожим мисленням. Ми поважаємо вашу конфіденційність. Будьте впевнені, що ми видалимо всі ваші дані у будь-який час на ваш запит'],
    ['ru', 'Добро пожаловать! Этот бот помогает динамически оценить вашу психологическую устойчивость. Также он позволяет вам найти людей со схожим мышлением. Мы уважаем вашу конфиденциальность. Будьте уверены, что мы удалим все ваши данные в любое время по вашему запросу'],
    ['es', '¡Bienvenido! Este bot te ayuda a evaluar dinámicamente tu resiliencia mental. También te permite encontrar personas con mentalidades similares. Respetamos tu privacidad. Tenga la seguridad de que eliminaremos todos sus datos en cualquier momento si lo solicita.'],
    ['de', 'Willkommen zurück! Dieser Bot hilft Ihnen, Ihre mentale Belastbarkeit dynamisch einzuschätzen. Es ermöglicht Ihnen auch, Menschen mit ähnlichen Denkweisen zu finden. Wir respektieren deine Privatsphäre. Seien Sie versichert, dass wir alle Ihre Daten jederzeit auf Ihren Wunsch löschen werden.']
]);
function processCommands(bot, tgData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
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
                        bot.sendMessage((_h = tgData.message) === null || _h === void 0 ? void 0 : _h.chat.id, tgWelcome.get(((_j = u.json) === null || _j === void 0 ? void 0 : _j.nativelanguage) ? (_k = u.json) === null || _k === void 0 ? void 0 : _k.nativelanguage : 'en'), tg_bot_start_menu((_l = u.json) === null || _l === void 0 ? void 0 : _l.nativelanguage));
                    }
                    else {
                        const user = new user_1.default(undefined, {
                            organizationid: new mongoose_1.Types.ObjectId('63c0e7dad80176886c22129d'),
                            tguserid: (_o = (_m = tgData.message) === null || _m === void 0 ? void 0 : _m.from) === null || _o === void 0 ? void 0 : _o.id,
                            nativelanguage: (_q = (_p = tgData.message) === null || _p === void 0 ? void 0 : _p.from) === null || _q === void 0 ? void 0 : _q.language_code,
                            blocked: false,
                            created: new Date()
                        });
                        yield user.save();
                        bot.sendMessage((_r = tgData.message) === null || _r === void 0 ? void 0 : _r.chat.id, tgWelcome.get(((_s = user.json) === null || _s === void 0 ? void 0 : _s.nativelanguage) ? (_t = user.json) === null || _t === void 0 ? void 0 : _t.nativelanguage : 'en'), tg_bot_start_menu((_u = user.json) === null || _u === void 0 ? void 0 : _u.nativelanguage));
                    }
                    break;
                case '/getnext':
                    break;
                case '/set_language':
                    menuSetLanguage(bot, (_v = tgData.message) === null || _v === void 0 ? void 0 : _v.chat.id, u);
                    break;
                default:
                    bot.sendMessage((_w = tgData.message) === null || _w === void 0 ? void 0 : _w.chat.id, `'${command_name}' is unknoun command. Check spelling`);
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
