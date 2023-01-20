import { Schema, Types, model } from "mongoose";
import PlutchikError from "./error";
import IMLString, {MLStringSchema} from "./mlstring";
import PlutchikProto from "./plutchikproto";
import {Md5} from 'ts-md5';
import User, { IUser } from "./user";

export const DEFAULT_SESSION_DURATION = 30;

export interface ISessionToken {
    _id: Types.ObjectId;
    organizationidref: Types.ObjectId;
    useridref: Types.ObjectId;
    expired: Date;
    roles: Array<string>;
    created: Date;
}
export interface IOrganization {
    _id: Types.ObjectId;
    name: string | IMLString;
    keys: Array<{
        roles: Array<string>;
        keyname: string;
        expired: Date;
        created: Date;
        keyhash: string;
    }>;
    created: Date;
    changed: Date;
}
export const SessionTokenSchema = new Schema({
    organizationidref: Types.ObjectId,
    useridref: Types.ObjectId,
    created: Date,
    expired: Date,
    roles: Array<string>
});
export const OrganizationSchema = new Schema({
    name: { oneOf:[
        String,
        MLStringSchema,
    ]},
    keys: [
    ],
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoOrgs = model<IOrganization>('organizations', OrganizationSchema);
export const mongoSessionTokens = model<ISessionToken>('sessiontokens', SessionTokenSchema);

export default class Organization extends PlutchikProto <IOrganization>{
    async load () {
        PlutchikProto.connectMongo();
        const org = await mongoOrgs.aggregate([{
            '$match': {
                '_id': this.id
            }
        }]);
        if (1 != org.length) throw new PlutchikError("organization:notfound", `id = '${this.id}'`);
        await super.load(org[0]);
    } 

    /**
     * Function checks pair organizationid and organizationkey. If pair is right then returns list of roles
     * @param key is key uuid 
     * @returns list of roles
     */ 
    public async checkKeyAndGetRoles(key: Types.ObjectId): Promise<Array<string>> {
        const md5 = Md5.hashStr(`${this.id} ${key}`);
        if (!this.data) throw new PlutchikError("organization:notloaded", `id = '${this.id}'`);
        for (const key of this.data?.keys) {
            if (key.keyhash == md5) {
                return key.roles;
            }
        }
        throw new PlutchikError("organization:wrongkey", `organizationid = '${this.id}'; organizationkey = '${key}'`)
    }

    /**
     * Function finds the actual session token and update its expired time or create new session token with exact roles 
     * @param uid User id
     * @param roles list of roles
     * @param sessionminutes default time of session period in minutes
     * @returns id of session token
     */
    public async checkAndUpdateSessionToken(uid: Types.ObjectId, roles: Array<string>, sessionminutes = DEFAULT_SESSION_DURATION): Promise<Types.ObjectId> {
        const sts = await mongoSessionTokens.aggregate([{
            '$match': {
                'organizationidref': this.id,
                'useridref': uid,
                'expired': {'$gte': new Date()}
            }
        }]);
        if (1 < sts.length) throw new PlutchikError("user:multiplesession", `organizationid = '${this.id}'; userid = '${uid}'`);
        console.log(`Active session token(s) found: ${sts.length}`);
        if (!sts.length) {
            const st = await mongoSessionTokens.insertMany([{
                organizationidref: this.id,
                useridref: uid,
                expired: new Date(new Date().getTime() + sessionminutes * 60000),
                roles: roles,
                created: new Date()
            }]);
            console.log(`New session token created: id = '${st[0]._id}'`);
            return st[0]._id;
        } else {
            const nexpired = new Date(new Date().getTime() + sessionminutes * 60000);
            if (sts[0].expired < nexpired) await mongoSessionTokens.findByIdAndUpdate(sts[0]._id, {expired:nexpired});
            console.log(`Session token updated: id = '${sts[0]._id}'`);
            return sts[0]._id;
        }
    }
}