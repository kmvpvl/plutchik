
export default class Telegram {
    private _token: string;
    constructor(token: string) {
        this._token = token; 
    }
    private _getCommandURL (method: string): string {
        return `https://api.telegram.org/bot${this._token}/${method}`;
    }
}
