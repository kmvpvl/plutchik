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
exports.server = exports.app = void 0;
const openapi_backend_1 = __importDefault(require("openapi-backend"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const version_1 = __importDefault(require("./api/version"));
const adduser_1 = __importDefault(require("./api/adduser"));
const getsessiontoken_1 = __importDefault(require("./api/getsessiontoken"));
const blockuser_1 = __importDefault(require("./api/blockuser"));
const addcontent_1 = __importDefault(require("./api/addcontent"));
const blockcontent_1 = __importDefault(require("./api/blockcontent"));
const addassessment_1 = __importDefault(require("./api/addassessment"));
const addorganizationkey_1 = __importDefault(require("./api/addorganizationkey"));
const organizationkeyslist_1 = __importDefault(require("./api/organizationkeyslist"));
const removeorganizationkey_1 = __importDefault(require("./api/removeorganizationkey"));
const createorganization_1 = __importDefault(require("./api/createorganization"));
const organizationinfo_1 = __importDefault(require("./api/organizationinfo"));
const telegram_1 = __importStar(require("./api/telegram"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const plutchikproto_1 = require("./model/plutchikproto");
const fs_1 = __importDefault(require("fs"));
const PORT = process.env.PORT || 8000;
function checkSecurity(c) {
    try {
        //const user = new User(c.request);
        return true;
    }
    catch (e) {
        return false;
    }
}
function notFound(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs_1.default.existsSync(`${__dirname}/api${req.originalUrl}`)) {
            return res.sendFile(`${__dirname}/api${req.originalUrl}`);
        }
        return res.status(404).json('Not found');
    });
}
const api = new openapi_backend_1.default({
    definition: 'plutchikAPI.yml'
});
api.init();
api.register({
    version: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, version_1.default)(c, req, res); }),
    createorganization: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, createorganization_1.default)(c, req, res); }),
    getsessiontoken: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, getsessiontoken_1.default)(c, req, res); }),
    adduser: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, adduser_1.default)(c, req, res); }),
    addorganizationkey: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, addorganizationkey_1.default)(c, req, res); }),
    organizationkeyslist: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, organizationkeyslist_1.default)(c, req, res); }),
    removeorganizationkey: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, removeorganizationkey_1.default)(c, req, res); }),
    organizationinfo: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, organizationinfo_1.default)(c, req, res); }),
    blockuser: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, blockuser_1.default)(c, req, res); }),
    unblockuser: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, blockuser_1.default)(c, req, res, false); }),
    addcontent: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, addcontent_1.default)(c, req, res); }),
    blockcontent: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, blockcontent_1.default)(c, req, res); }),
    unblockcontent: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, blockcontent_1.default)(c, req, res, false); }),
    addassessment: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, addassessment_1.default)(c, req, res); }),
    telegram: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, telegram_1.default)(c, req, res, bot); }),
    tgwebapp: (c, req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, telegram_1.webapp)(c, req, res, bot); }),
    validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
    notFound: (c, req, res) => notFound(c, req, res),
    notImplemented: (c, req, res) => res.status(500).json({ err: 'not implemented' }),
    unauthorizedHandler: (c, req, res) => res.status(401).json({ err: 'not auth' })
});
api.registerSecurityHandler('PlutchikAuthOrganizationId', checkSecurity);
api.registerSecurityHandler('PlutchikAuthOrganizationKey', checkSecurity);
api.registerSecurityHandler('PlutchikAuthUserId', checkSecurity);
api.registerSecurityHandler('PlutchikAuthSessionToken', checkSecurity);
exports.app = (0, express_1.default)();
const bot = new node_telegram_bot_api_1.default(plutchikproto_1.settings.tg_bot_authtoken);
bot.on('photo', msg => {
    (0, telegram_1.onPhoto)(bot, msg);
});
if (plutchikproto_1.settings.tg_web_hook_server) {
    bot.setWebHook(`${plutchikproto_1.settings.tg_web_hook_server}/telegram`);
    bot.setMyCommands([
        { command: '/start', description: 'Start', },
        { command: '/set_language', description: 'Set language', },
    ], { language_code: 'en' });
    bot.setMyCommands([
        { command: '/start', description: 'Comenzar', },
        { command: '/set_language', description: 'Elegir lenguaje', },
    ], { language_code: 'es' });
    bot.setMyCommands([
        { command: '/start', description: 'Start', },
        { command: '/set_language', description: 'Sprache einstellen', },
    ], { language_code: 'de' });
    bot.setMyCommands([
        { command: '/start', description: 'Почати', },
        { command: '/set_language', description: 'Встановити мову', },
    ], { language_code: 'uk' });
    bot.setMyCommands([
        { command: '/start', description: 'Начать', },
        { command: '/set_language', description: 'Установить язык', },
    ], { language_code: 'ru' });
}
;
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)('tiny'));
exports.app.use((0, cors_1.default)());
// use as express middleware
exports.app.use((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield api.handleRequest({
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query,
            headers: req.headers
        }, req, res);
    }
    catch (e) {
        return res.status(500).json({ code: "Wrong parameters", description: `Request ${req.url}- ${e.message}` });
    }
}));
exports.server = exports.app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
