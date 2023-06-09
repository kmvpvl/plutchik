"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = __importDefault(require("./error"));
let s;
try {
    s = require("../settings.json");
    for (let v in s) {
        process.env[v] = s[v];
    }
}
catch (err) {
    //console.log(`${colours.bg.red}${err.message}${colours.reset}`);
    s = undefined;
}
function checkSettings() {
    if (process.env.mongouri === undefined)
        throw new error_1.default("mongo:connect", `Environment variable 'mongouri' can't be read`);
    if (process.env.tg_bot_authtoken === undefined)
        throw new error_1.default("mongo:connect", `Environment variable 'tg_bot_authtoken' can't be read`);
}
exports.default = checkSettings;
;
