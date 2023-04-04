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
const error_1 = __importDefault(require("../model/error"));
const colours_1 = __importDefault(require("../model/colours"));
const organization_1 = __importStar(require("../model/organization"));
const plutchikproto_1 = __importStar(require("../model/plutchikproto"));
const content_1 = __importStar(require("../model/content"));
const user_1 = __importStar(require("../model/user"));
const googleapis_1 = require("googleapis");
const mongoose_1 = require("mongoose");
function telegram(c, req, res, bot) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${colours_1.default.fg.green}API: telegram function${colours_1.default.reset}`);
        const tgData = req.body;
        if (tgData.message) {
        }
        console.log(`${colours_1.default.fg.blue}Telegram userId = '${(_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.from) === null || _b === void 0 ? void 0 : _b.id}'${colours_1.default.reset}; chat_id = '${(_c = tgData.message) === null || _c === void 0 ? void 0 : _c.chat.id}'`);
        try {
            if (!(yield processCommands(bot, tgData))
                && !(yield processURLs(bot, tgData))) {
                bot.sendMessage((_d = tgData.message) === null || _d === void 0 ? void 0 : _d.chat.id, `Sorry, i couldn't apply this content. Check spelling`);
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
        try {
            if (req.query['command']) {
                switch (req.query['command']) {
                    case 'getnext':
                        const user = yield getUserByTgUserId(parseInt(req.query['tg_user_id']));
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
const tg_bot_start_menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Assess new content',
                    web_app: {
                        url: `${plutchikproto_1.settings.tg_web_hook_server}/telegram`
                    }
                }
            ]
        ]
    }
};
const tgWelcome = `Welcome back!\nThis bot helps you finding people with similar mindset.\nWe respect your privacy. Be sure that we'll delete all your data at any moment you request`;
function processCommands(bot, tgData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function* () {
        // looking for bot-command from user
        const commands = (_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.entities) === null || _b === void 0 ? void 0 : _b.filter(v => v.type == "bot_command");
        if (!commands || !commands.length)
            return false;
        console.log(`command(s) found: ${(_c = tgData.message) === null || _c === void 0 ? void 0 : _c.text}`);
        for (let [i, c] of Object.entries(commands)) {
            const command_name = (_e = (_d = tgData.message) === null || _d === void 0 ? void 0 : _d.text) === null || _e === void 0 ? void 0 : _e.substring(c.offset, c.offset + c.length);
            console.log(`${colours_1.default.fg.green}Processing command = '${command_name}'${colours_1.default.reset}`);
            switch (command_name) {
                case '/start':
                    if (yield getUserByTgUserId((_g = (_f = tgData.message) === null || _f === void 0 ? void 0 : _f.from) === null || _g === void 0 ? void 0 : _g.id)) {
                        bot.sendMessage((_h = tgData.message) === null || _h === void 0 ? void 0 : _h.chat.id, tgWelcome, tg_bot_start_menu);
                    }
                    else {
                        const user = new user_1.default(undefined, {
                            organizationid: new mongoose_1.Types.ObjectId('63c0e7dad80176886c22129d'),
                            tguserid: (_k = (_j = tgData.message) === null || _j === void 0 ? void 0 : _j.from) === null || _k === void 0 ? void 0 : _k.id,
                            nativelanguage: (_m = (_l = tgData.message) === null || _l === void 0 ? void 0 : _l.from) === null || _m === void 0 ? void 0 : _m.language_code,
                            blocked: false,
                            created: new Date()
                        });
                        yield user.save();
                        bot.sendMessage((_o = tgData.message) === null || _o === void 0 ? void 0 : _o.chat.id, tgWelcome, tg_bot_start_menu);
                    }
                    /*                 const cb = await bot.setMyCommands([
                                        {
                                            command: 'getnext',
                                            description: 'Get next content item for assessment'
                                        }
                                    ], { scope: {type: "all_private_chats"}});
                                    //await bot.set
                                    const mb = await bot.setChatMenuButton({
                                        chat_id: undefined,
                                        menu_button: {
                                            type: 'default',
                                            text: 'ASSESS',
                                            web_app: {
                                                url: `${settings.tg_web_hook_server}/telegram`
                                            }
                                      }
                                    });
                                    console.log(`Menu button has been set: ${mb}`);
                    */ break;
                case '/getnext':
                    break;
                default:
                    bot.sendMessage((_p = tgData.message) === null || _p === void 0 ? void 0 : _p.chat.id, `'${command_name}' is unknoun command. Check spelling`);
                    return false;
            }
        }
        return true;
    });
}
function yt_id(url) {
    const r = url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);
    return r ? r[1] : undefined;
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
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        // looking for URL
        const URLs = (_b = (_a = tgData.message) === null || _a === void 0 ? void 0 : _a.entities) === null || _b === void 0 ? void 0 : _b.filter(v => v.type == "url");
        if (!URLs || !URLs.length)
            return false;
        console.log(`url(s) found: ${(_c = tgData.message) === null || _c === void 0 ? void 0 : _c.text}`);
        for (let [i, u] of Object.entries(URLs)) {
            const url_name = (_e = (_d = tgData.message) === null || _d === void 0 ? void 0 : _d.text) === null || _e === void 0 ? void 0 : _e.substring(u.offset, u.offset + u.length);
            console.log(`${colours_1.default.fg.green}Processing URL = '${url_name}'${colours_1.default.reset}`);
            const ytId = yt_id(url_name);
            if (ytId) {
                console.log(`YOUTUBE content found: videoId = '${ytId}'`);
                const data = (yield yt_video_data(ytId)).data;
                // !! need error handling
                //console.log(data.items);
                let org = yield getOrganizationByTgUser(bot, tgData);
                if (org) {
                    for (let [i, ytVi] of Object.entries(data.items)) {
                        let snippet = ytVi.snippet;
                        console.log(`Title: '${snippet.title}', tags: '${snippet.tags}'`);
                        let ic = {
                            organizationid: (_f = org.json) === null || _f === void 0 ? void 0 : _f._id,
                            url: url_name,
                            type: "video",
                            source: "youtube",
                            name: snippet.title,
                            tags: snippet.tags,
                            description: snippet.description,
                            language: snippet.defaultAudioLanguage,
                            blocked: false,
                            created: new Date(),
                            restrictions: []
                        };
                        if (!ic.language)
                            ic.language = 'en';
                        let content = new content_1.default(undefined, ic);
                        yield content.save();
                        const msg = `New content added`;
                        bot.sendMessage((_g = tgData.message) === null || _g === void 0 ? void 0 : _g.chat.id, msg, { disable_notification: true });
                    }
                }
                else {
                    const msg = `Role 'manage_content' expected`;
                    bot.sendMessage((_h = tgData.message) === null || _h === void 0 ? void 0 : _h.chat.id, msg);
                }
            }
            else {
                console.log(`Couldn't recognize known domain: ${url_name}`);
            }
        }
        return true;
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
function addContent(bot, tgData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
            if (!organization_1.default.checkRoles(ikey.roles, "manage_content")) {
                const msg = `Role 'manage_content' expected`;
                bot.sendMessage((_e = tgData.message) === null || _e === void 0 ? void 0 : _e.chat.id, msg);
                //return res.status(200).json(msg);
            }
        }
        let content;
        if ((_f = tgData.message) === null || _f === void 0 ? void 0 : _f.media_group_id) {
            const cc = yield content_1.mongoContent.aggregate([{
                    "$match": {
                        "tgData.media_group_id": {
                            $eq: (_g = tgData.message) === null || _g === void 0 ? void 0 : _g.media_group_id
                        }
                    }
                }]);
            if (cc.length)
                content = new content_1.default(undefined, cc[0]);
        }
        if (!org)
            throw new error_1.default("organization:notfound", `Unexpected situation`);
        if (!content) {
            let ic = {
                organizationid: (_h = org.json) === null || _h === void 0 ? void 0 : _h._id,
                type: "memes",
                source: "telegram",
                name: ((_j = tgData.message) === null || _j === void 0 ? void 0 : _j.caption) ? (_k = tgData.message) === null || _k === void 0 ? void 0 : _k.caption : '',
                tags: [],
                description: '',
                language: '',
                tgData: [],
                blocked: false,
                created: new Date(),
                restrictions: []
            };
            content = new content_1.default(undefined, ic);
        }
        const mc = content.json;
        (_l = mc === null || mc === void 0 ? void 0 : mc.tgData) === null || _l === void 0 ? void 0 : _l.push(tgData.message);
        yield content.load(mc);
        yield content.save();
    });
}
