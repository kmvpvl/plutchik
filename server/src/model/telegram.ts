import colours from "./colours";
const timeoutBetweenMessages = 1000;
export default class Telegram {
    private _token: string;
    private prev_call_time?: Date;
    constructor(token: string) {
        this._token = token; 
    }
    private _getCommandURL (method: string): string {
        return `https://api.telegram.org/bot${this._token}/${method}`;
    }
    private async callMethod(method: string, params: any): Promise<any> {
        let timeoutNeed = 0;
        if (this.prev_call_time === undefined) {
            this.prev_call_time = new Date();
        } else {
            const newDate = new Date();
            timeoutNeed = newDate.getTime() - this.prev_call_time.getTime() - timeoutBetweenMessages;
        }
        const headers = new Headers();
        headers.set("Charset", "UTF-8");
        headers.set("Content-Type", "application/json");
        const rawresp = fetch(this._getCommandURL(method), {
            method: "POST",
            headers: headers,
            body: JSON.stringify(params)
        });

        rawresp.catch((reason: any) =>{
            console.log(`${colours.fg.red}Failed call telegram method = '${method}', reason = '${JSON.stringify(reason)}'${colours.reset}`);
        });
        return rawresp
        .then(res=>{
            return res.json()
        })
        .then(data=> {
            if (data.ok) return data.result;
            console.log(`${colours.fg.red}Telegram method = '${method}' returns wrong data, response from server = '${JSON.stringify(data)}', request to server = '${JSON.stringify(params)}'${colours.reset}`);
            throw new Error(JSON.stringify(data));
        });
    }
    async setMyDescription(description?: string, language_code?: string): Promise<boolean> {
        const rawResponse = this.callMethod('setMyDescription', {description: description, language_code: language_code});
        return rawResponse;
    }
    async setMyShortDescription(short_description?: string, language_code?: string): Promise<boolean> {
        const rawResponse = this.callMethod('setMyShortDescription', {short_description: short_description, language_code: language_code});
        return rawResponse;
    }
    async setMyName(name?: string, language_code?: string) {
        const rawResponse = this.callMethod('setMyName', {name: name, language_code: language_code});
        return rawResponse;
    }
}
