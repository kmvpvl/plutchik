import colours from "./colours";
const timeoutBetweenMessages = 1000;
const repeatCount = 5;
type TelegramCommand = {
    method: string;
    params: any;
}

interface QueueTelegramCommand {
    telegramCommand: TelegramCommand,
    commandCallTimes: number,
    promise: Promise<any>
}

export default class Telegram {
    private _token: string;
    
    constructor(token: string) {
        this._token = token; 
    }

    private _getCommandURL (method: string): string {
        return `https://api.telegram.org/bot${this._token}/${method}`;
    }
    private async callMethod(tc: TelegramCommand): Promise<any> {
        const headers = new Headers();
        headers.set("Charset", "UTF-8");
        headers.set("Content-Type", "application/json");
        const rawresp = fetch(this._getCommandURL(tc.method), {
            method: "POST",
            headers: headers,
            body: JSON.stringify(tc.params)
        });

        rawresp.catch((reason: any) =>{
            console.log(`${colours.fg.red}Failed call telegram command '${JSON.stringify(tc)}', reason = '${JSON.stringify(reason)}'${colours.reset}`);
        });
        return rawresp
        .then(res=>{
            return res.json()
        })
        .then(data=> {
            if (data.ok) {
                return data.result;
            }
            console.log(`${colours.fg.red}Telegram command = '${JSON.stringify(tc)}' returns wrong data, response from server = '${JSON.stringify(data)}'${colours.reset}`);
            //if (429) return new Promise((this.callMethod)=>setTimeout(()=>this.callMethod(tc), delay));
            throw new Error(JSON.stringify(data));
        });
    }
    async setMyDescription(description?: string, language_code?: string): Promise<boolean> {
        const rawResponse = this.callMethod({
            method: 'setMyDescription', 
            params: {description: description, language_code: language_code}});
        return rawResponse;
    }
    async setMyShortDescription(short_description?: string, language_code?: string): Promise<boolean> {
        const rawResponse = this.callMethod({
            method:'setMyShortDescription', 
            params: {short_description: short_description, language_code: language_code}});
        return rawResponse;
    }
    async setMyName(name?: string, language_code?: string): Promise<boolean> {
        return this.callMethod({
            method: 'setMyName', 
            params: {name: name, language_code: language_code}});
    }
}
