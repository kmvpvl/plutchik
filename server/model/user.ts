import { Schema, Types, model } from "mongoose";
import PlutchikError from "./error";
import IMLString, {MLStringSchema} from "./mlstring";
import PlutchikProto from "./plutchikproto";

export interface IUser {
    _id: Types.ObjectId;
    organizationid: Types.ObjectId;
    useridinorganization: string;
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
    useridinorganization: String,
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
    public async load() {
        const users = await mongoUsers.aggregate([
            {
                '$match': {
                    '_id': this.id
                } 
            }
        ]);
        if (1 != users.length) throw new PlutchikError("user:notfound", `id = '${this.id}'`)
        super.load();
    }

}