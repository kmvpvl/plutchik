import TelegramBot from "node-telegram-bot-api";
import colours from "./colours";
import PlutchikError from "./error";
import ML from "./mlstring";

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
    console.log(`Settings read successfully: '${JSON.stringify(process.env, null, 2)}'`)
};

export async function setupTelegramBot(bot: TelegramBot) {
    let ret = false;
    //bot info
    /* for a while manually
    try {
        ret = await bot.setMyName(process.env.tg_bot_name);
        console.log(`${colours.fg.green}Setting TG setMyName successful '${JSON.stringify(ret)}'${colours.reset}`)
    } catch(reason: any) {
        console.log(`${colours.fg.red}Setting TG setMyName error '${JSON.stringify(reason)}'${colours.reset}`);
    }
    */
    //trying create webhook
    try {
        // on render.com got the error if webhook already installed, because getting webhook info first 
        const newURL = `${process.env.tg_web_hook_server}/telegram`;
        const webhookInfo = await bot.getWebHookInfo();
        if (webhookInfo.url === newURL) {
            console.log(`${colours.fg.green}TG web hook url = '${webhookInfo.url}' already created${colours.reset}`);
        } else {
            console.log(`${colours.fg.yellow}Old TG web hook url = '${webhookInfo.url}' found. Trying to change${colours.reset}`);
            try {
                ret = await bot.setWebHook(newURL);
                console.log(`${colours.fg.green}TG web hook url = '${newURL}' created successfully${colours.reset}`);
            } catch (reason: any) {
                console.log(`${colours.fg.red}Setting TG webhook error '${JSON.stringify(reason)}'${colours.reset}`);
            }
        }
    } catch(reason: any) {
        console.log(`${colours.fg.red}Setting TG getWebhookInfo error '${JSON.stringify(reason)}'${colours.reset}`);
    }

    //bot menu, description and short description
    try {
        ret = await bot.setChatMenuButton({menu_button: {type: "commands"}})
        console.log(`${colours.fg.green}TG SetChatMenuButton return '${ret}' ${colours.reset}`);
        const langs = [undefined, "de", "fr", "es", "uk", "ru", "it"];
        for (const [i, lang] of Object.entries(langs)) {
            try {
                ret = await bot.setMyCommands([{command: "start", description: lang===undefined?"Register me":ML("Register me", lang)},
                    {command: "home", description: lang===undefined?"Main menu":ML("Main menu", lang)}, 
                    {command: "help", description: lang===undefined?"I have an issue, pls help me": ML("I have an issue, pls help me", lang)}], {language_code: lang});
                console.log(`${colours.fg.green}Setting TG setMyCommand successful for lang(${lang}) = '${JSON.stringify(ret)}'${colours.reset}`);
            } catch(reason: any){
                console.log(`${colours.fg.red}Setting TG setMyCommand for lang(${lang}) error '${JSON.stringify(reason)}'${colours.reset}`)
            }
            try {
                ret = await (bot as any).setMyShortDescription({short_description: ML('Match mind first', lang), language_code: lang});
                console.log(`${colours.fg.green}Setting TG setMyShortDescription for lang = '${lang}' successful '${JSON.stringify(ret)}'${colours.reset}`);
            } catch (reason: any) {
                console.log(`${colours.fg.red}Setting TG setMyShortDescription for ${lang} langs error '${JSON.stringify(reason)}'${colours.reset}`)
            }

            try {
                ret = await (bot as any).setMyDescription({description: ML(`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`, lang), language_code: lang});
                console.log(`${colours.fg.green}Setting TG setMyDescription for lang = '${lang}' successful '${JSON.stringify(ret)}'${colours.reset}`);
            } catch (reason: any) {
                console.log(`${colours.fg.red}Setting TG setMyDescription for lang = '${lang}' error '${JSON.stringify(reason)}'${colours.reset}`);
            }
        }
    } catch(reason: any) {
        console.log(`${colours.fg.red}Setting TG SetChatMenuButton error '${JSON.stringify(reason)}'${colours.reset}`);
    }
}
