"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colours_1 = __importDefault(require("./colours"));
class PlutchikError extends Error {
    constructor(code, description) {
        const descs = new Map([
            ["mongo:connect", "Couldn'n connect to MongoDB"],
            ["forbidden:rolerequiered", "U need role doing this operation"],
            ["organization:notfound", "Organization id not found"],
            ["organization:notloaded", "Organization id not loaded"],
            ["organization:wrongkey", "Organization has no that key"],
            ["user:notfound", "User id not found"],
            ["user:notloaded", "User id not loaded"],
            ["user:hasnoactivesession", "User has no active session"],
            ["user:multiplesession", "User has more that one active session"],
            ["content:notfound", "Content id not found"],
            ["content:notloaded", "Content id not loaded"],
            ["assessment:notfound", "assessment id not found"],
            ["assessment:notloaded", "assessment id not loaded"],
        ]);
        super(`${descs.get(code)} - ${description}`);
        this.code = code;
        this.description = this.message;
        console.error(`${colours_1.default.fg.red}Error occured: code: ${code}; desc: ${description}${colours_1.default.reset}`);
    }
    toString() { return this.message; }
}
exports.default = PlutchikError;
