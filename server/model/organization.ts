import { Schema, Types, model } from "mongoose";
import PlutchikError from "./error";
import IMLString, {MLStringSchema} from "./mlstring";
import PlutchikProto from "./plutchikproto";
import {Md5} from 'ts-md5';
import { RoleType } from "./user";
import colours from "./colours";

export const DEFAULT_SESSION_DURATION = 30;

export interface IKey {
    keyname: string;
    keyhash: string;
    created: Date;
    expired?: Date;
    roles: Array<RoleType>;
}
export interface ISessionToken {
    _id: Types.ObjectId;
    organizationidref: Types.ObjectId;
    useridref: Types.ObjectId;
    expired: Date;
    roles: Array<RoleType>;
    created: Date;
}
export interface IOrganization {
    _id: Types.ObjectId;
    name: string | IMLString;
    keys: Array<IKey>;
    created: Date;
    changed: Date;
}
export const SessionTokenSchema = new Schema({
    organizationidref: Types.ObjectId,
    useridref: Types.ObjectId,
    created: Date,
    expired: Date,
    roles: Array<RoleType>
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
    async load (data?: IOrganization) {
        if (!data) {
            PlutchikProto.connectMongo();
            const org = await mongoOrgs.aggregate([{
                '$match': {
                    '_id': this.id
                }
            }]);
            if (1 != org.length) throw new PlutchikError("organization:notfound", `id = '${this.id}'`);
            await super.load(org[0]);
        } else {
            await super.load(data);
        }
    } 

    public async addKey(name: string, roles: Array<RoleType>): Promise<Types.ObjectId> {
        await this.checkData();
        const oNK: Types.ObjectId = new Types.ObjectId();
        const md5 = Md5.hashStr(`${this.id} ${oNK}`);

        const nk: IKey = {
            keyname: name,
            roles: roles,
            keyhash: md5,
            created: new Date()
        };
        this.data?.keys.push(nk);
        await this.save();
        return oNK;
    }

    public async removeKey(id: number) {
        // never remove first organization key
        if (id) this.data?.keys.splice(id, 1);
        await this.save();
    }

    /**
     * Function checks pair organizationid and organizationkey. If pair is right then returns list of roles
     * @param key is key uuid 
     * @returns list of roles
     */ 
    public async checkKeyAndGetRoles(key: Types.ObjectId): Promise<Array<RoleType>> {
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

    static checkRoles(roles_had: Array<RoleType>, role_to_find: RoleType): boolean {
        const superivor_role: RoleType = "supervisor";
        if (roles_had.includes(superivor_role)) return true;
        return roles_had.includes(role_to_find);
    }

    public async save() {
        PlutchikProto.connectMongo();
        await this.checkData();
        await super.save();
        if (this.id){
            await mongoOrgs.findByIdAndUpdate(this.id, this.data);
            console.log(`Organization data was successfully updated. Org id = '${this.id}'`);
        } else { 
            const orgInserted = await mongoOrgs.insertMany([this.data]);
            this.id = orgInserted[0]._id;
            this.load(orgInserted[0]);
            console.log(`New organization was created. ${colours.fg.blue}Org id = '${this.id}'${colours.reset}`);
        }
    }
}