import mongoose, { Model, Types, connect } from "mongoose";

type MongoErrorCode = "settings:mongouriundefined" 
| "mongo:connect" 
| "mongo:datanotloaded"
| "mongo:objectnotfoundbyid";

class MongoError extends Error {
    constructor(code:MongoErrorCode, message?: string) {
        super(`code: ${code} - ${message}`);
    }
}

export default class MongoProto<T> {
    protected data?: T;
    protected id?: Types.ObjectId;
    protected model: Model<T>;
    constructor (model: Model<T>, id?: Types.ObjectId, data?: T){
        this.model = model;
        if (id) this.id = id;

        if (data) {
            this.data = data;
            if((data as any)["_id"]) this.id = new Types.ObjectId((data as any)["_id"]);
        }
    }
    public async load(data?: T) {
        if (data) {
            this.data = data;
            if((data as any)["_id"]) this.id = new Types.ObjectId((data as any)["_id"]);
        } else {
            MongoProto.connectMongo();
            const data = await this.model.aggregate([
                {"$match": {"_id": this.id}}
            ]);
            if (1 !== data.length) throw new MongoError("mongo:objectnotfoundbyid", `type='${this.constructor.name}'; _id='${this.id}'`);
            await this.load(data[0]);
            await this.checkData();
        }
    }
    public get uid():Types.ObjectId{
        if (this.id === undefined) throw new MongoError("mongo:datanotloaded", `cannot return uid type='${this.constructor.name}}'; data = '${JSON.stringify(this.data)}'`);
        return this.id;
    }
    public static connectMongo(){
        let uri = process.env.mongouri as string;
        mongoose.set('strictQuery', false);
        connect(uri)
        .catch((err)=>{
            try {
                throw new MongoError("mongo:connect", `err=${err.message}; uri="${uri}"`)
            } catch(e){
                console.error(e);
            }
        });
    
    }
    get json() { 
        return this.data;
    }
    protected async checkData(){
        if (!this.data) throw new MongoError("mongo:datanotloaded", `type='${this.constructor.name}}'; id = '${this.id}'`);
    }
    protected getHistoryInfo(): any {
        return {
            //user: this.user.name,
            changed: new Date(),
        };        
    }
    public async save(){
        MongoProto.connectMongo();
        await this.checkData();
        
        if (this.data) {
            if (this.data && /*this.data.hasOwnProperty('created') &&*/ (this.data as any).created === undefined) (this.data as any).created = new Date();
            (this.data as any).changed = new Date();
            let h = this.getHistoryInfo();
            let history = new Array<any>;
            //if (('history' in this.data)) history = (this.data as any).history;
            //history.push(h); 
            //(this.data as any).history = history;
        }
        
        if (this.id && this.data){
            await this.model.findOneAndReplace({_id: this.id}, this.data);
            console.log(`✅ Object data was successfully updated.  type='${this.constructor.name}'; id = '${this.id}'`);
        } else { 
            const objectInserted = await this.model.insertMany([this.data]);
            this.id = new Types.ObjectId(objectInserted[0]._id as string);
            this.load(objectInserted[0]);
            console.log(`✅ New object was created. type='${this.constructor.name}'; id = '${this.id}'`);
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
