import mongoose, { connect, Types } from "mongoose";
import PlutchikError from "./error";

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
        let uri = 'mongodb://0.0.0.0/PLUTCHIK';
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
