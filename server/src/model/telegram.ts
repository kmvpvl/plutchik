
export default class Telegram {
    private _token: string;
    constructor(token: string) {
        this._token = token; 
    }
    private _getCommandURL (method: string): string {
        return `https://api.telegram.org/bot${this._token}/${method}`;
    }
    private async callMethod(method: string, params: any): Promise<any> {
        const headers = new Headers();
        headers.set("Charset", "UTF-8");
        headers.set("Content-Type", "application/json");
        const rawresp = fetch(this._getCommandURL(method), {
            method: "POST",
            headers: headers,
            body: JSON.stringify(params)
        })
        rawresp.catch(reason=>console.log(`Failed call method = '${method}', reason = '${JSON.stringify(reason)}'`));
        return rawresp
        .then(res=>res.json())
        .then(data=>data.ok?data.result:undefined);
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
