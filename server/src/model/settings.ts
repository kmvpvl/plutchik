import colours from "./colours";
import PlutchikError from "./error";

let s;
try {
    s = require("../settings.json");
    for (let v in s) {
        process.env[v] = s[v];
    }
} catch (err: any) {
    //console.log(`${colours.bg.red}${err.message}${colours.reset}`);
    s = undefined;
}

export default function checkSettings(){
    if (process.env.mongouri === undefined) throw new PlutchikError("mongo:connect", `Environment variable 'mongouri' can't be read`);
    if (process.env.tg_bot_authtoken === undefined) throw new PlutchikError("mongo:connect", `Environment variable 'tg_bot_authtoken' can't be read`);
};