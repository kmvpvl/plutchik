import { Schema, Types, model } from "mongoose";
import colours from "./colours";
import PlutchikError from "./error";
import IMLString, {MLStringSchema} from "./mlstring";
import PlutchikProto from "./plutchikproto";

export interface IUser {
    _id: Types.ObjectId;
    organizationid: Types.ObjectId;
    birthdate: Date;
    nativelanguage: string;
    secondlanguages: Array<string>,
    location: string;
    gender: string;
    maritalstatus: string;
    features: string;
    blocked: boolean;
    created: Date;
    changed: Date;
    history: Array<any>;
}

export const UserSchema = new Schema({
    organizationid: Types.ObjectId,
    birthdate: Date,
    nativelanguage: String,
    secondlanguages: Array<string>,
    location: String,
    gender: String,
    maritalstatus: String,
    features: String,
    blocked: Boolean,
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoUsers = model<IUser>('users', UserSchema);

export default class User extends PlutchikProto<IUser> {
    public async load(data?: IUser) {
        if (!data) {
            const users = await mongoUsers.aggregate([
                {
                    '$match': {
                        '_id': this.id
                    } 
                }
            ]);
            if (1 != users.length) throw new PlutchikError("user:notfound", `id = '${this.id}'`)
            await super.load(users[0]);
        } else {
            await super.load(data);
        }
    }
    protected async checkData(): Promise<void> {
        if (!this.data) throw new PlutchikError("user:notloaded", `userid = '${this.id}'`);
    }
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }
    public async save() {
        PlutchikProto.connectMongo();
        await this.checkData();
        await super.save();
        if (this.id){
            await mongoUsers.findByIdAndUpdate(this.id, this.data);
            console.log(`User data was successfully updated. User id = '${this.id}'`);
        } else { 
            const userInserted = await mongoUsers.insertMany([this.data]);
            this.id = userInserted[0]._id;
            this.load(userInserted[0]);
            console.log(`New user was created. ${colours.fg.blue}User id = '${this.id}'${colours.reset}`);
        }
    }
}