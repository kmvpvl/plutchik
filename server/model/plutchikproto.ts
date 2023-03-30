import mongoose, { connect, SchemaTypeOptions, Types } from "mongoose";
import colours from "./colours";
import PlutchikError from "./error";
export let settings: any = {};
try {
    settings = require("../settings.json");
} catch (err: any) {
    console.log(`${colours.bg.red}${err.message}${colours.reset}`);
    if (!process.env["mongouri"]) throw new PlutchikError("mongo:connect", `Environment variable 'mongouri' can't be read`);
    settings.mongouri = process.env["mongouri"];
    if (!process.env["tg_bot_authtoken"]) throw new PlutchikError("mongo:connect", `Environment variable 'tg_bot_authtoken' can't be read`);
    settings.tg_bot_authtoken = process.env["tg_bot_authtoken"];
    settings.tg_web_hook_server = process.env["tg_web_hook_server"];
}

export default class PlutchikProto<T> {
    protected data?: T;
    protected id?: Types.ObjectId;
    constructor (id?: Types.ObjectId, data?: T){
        if (id) this.id = id;

        if (data) {
            this.data = data;
            if((data as any)["_id"]) this.id = (data as any)["_id"];
        }
    }
    public async load(data?: T) {
        if (data) {
            this.data = data;
            if((data as any)["_id"]) this.id = (data as any)["_id"];
        }
        await this.checkData();
    }
    public static connectMongo(){
        let uri = settings.mongouri;
        mongoose.set('strictQuery', false);
        connect(uri)
        .catch((err)=>{
            try {
                throw new PlutchikError("mongo:connect", `err=${err.message}; uri="${uri}"`)
            } catch(e){
                console.error(e);
            }
        });
    
    }
    get json() { 
        return this.data;
    }
    protected async checkData(){}
    protected getHistoryInfo(): any {
        return {
            //user: this.user.name,
            changed: new Date(),
        };        
    }
    public async save(){
        if (this.data) {
            (this.data as any).changed = new Date();
            let h = this.getHistoryInfo();
            let history = new Array<any>;
            //if (('history' in this.data)) history = (this.data as any).history;
            //history.push(h); 
            //(this.data as any).history = history;
        }
    }
    public clone(): T {
        let n: any = {};
        Object.assign(n, this.data);
        delete n._id;
        delete n.history;
        n.created = new Date();
        return n as T;
    }
}
