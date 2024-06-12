import { Schema, Types, model } from "mongoose";
import PlutchikError from "./error";
import {MLString, MLStringSchema} from "./mlstring";
import User, { RoleType } from "./user";
import colours from "./colours";
import TelegramBot from "node-telegram-bot-api";
import { IContent, mongoContent } from "./content";
import MongoProto from "./mongoproto";
import { mongoAssessments } from "./assessment";

export const DEFAULT_SESSION_DURATION = 10080;

export interface IParticipant {
    _id?: Types.ObjectId;
    uid: Types.ObjectId;
    created: Date;
    expired?: Date;
    roles: Array<RoleType>;
}
export interface ISessionToken {
    _id: Types.ObjectId;
    useridref: Types.ObjectId;
    expired: Date;
    created: Date;
}
export interface IOrganization {
    _id?: Types.ObjectId;
    name: MLString;
    participants: Array<IParticipant>;
    emails: Array<string>;
    created: Date;
    changed?: Date;
}
export const SessionTokenSchema = new Schema({
    useridref: Types.ObjectId,
    created: Date,
    expired: Date,
    roles: Array<RoleType>
});
export const OrganizationSchema = new Schema({
    name: String,
    participants: [],
    emails: [],
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoOrgs = model<IOrganization>('organizations', OrganizationSchema);
export const mongoSessionTokens = model<ISessionToken>('sessiontokens', SessionTokenSchema);

export default class Organization extends MongoProto <IOrganization>{
    constructor(id?: Types.ObjectId, data?: IOrganization){
        super(mongoOrgs, id, data);
    }

    public async addParticipant(uid: Types.ObjectId, roles: Array<RoleType>) {
        await this.checkData();
        const p: IParticipant =  {
            uid: uid,
            created: new Date(),
            roles: roles
        };
        this.data?.participants.push(p);
        await this.save();
    }

    public async removeParticipant(uid: Types.ObjectId) {
        await this.checkData();
        if (this.data) this.data.participants = this.data?.participants.filter((v)=>uid.equals(v.uid));
        await this.save();
    }

    public async getParticipantRoles(uid: Types.ObjectId): Promise<Array<RoleType>> {
        await this.checkData();
        const p = this.data?.participants.filter(v=>uid.equals(v.uid));
        if (p && p.length === 1) return p[0].roles;
        throw new PlutchikError("organization:wrongtguserid", `organizationid='${this.uid}'; uid='${uid}'`)
    }

    public async rename(newName: string) {
      await this.checkData();
      if (this.data) this.data.name = newName;
      await this.save();
  }

    public async getFirstLettersOfContentItems(): Promise<Array<string>> {
        await this.checkData();
        const letters = await mongoContent.aggregate([
            {
              '$match': {
                'organizationid': this.id
              }
            }, {
              '$project': {
                'l': {
                  '$substrCP': [
                    '$name', 0, 1
                  ]
                }
              }
            }, {
              '$group': {
                '_id': '$l', 
                'count': {
                  '$sum': 1
                }
              }
            }, {
              '$sort': {
                '_id': 1
              }
            }
          ]);
        return letters;
    }
    public async getContentItems(): Promise<Array<IContent>> {
        await this.checkData();
        const ci = await mongoContent.aggregate([
            {'$match': {
                'organizationid': this.id
            }},
            {'$lookup': {
                from: "groups",
                localField: "_id",
                foreignField: "items",
                as: "groups"
            }},
            {'$sort': {
                changed: -1
            }}
        ]);
        return ci;
    }
    async checkRoles(user: User, role_to_find: RoleType): Promise<boolean> {
        await this.checkData();
        const user_roles = this.data?.participants.filter(v=>user.uid.equals(v.uid));
        if (!user_roles) return false;
        if (user_roles[0].roles.includes("supervisor") 
            || user_roles[0].roles.includes("administrator")
            || user_roles[0].roles.includes(role_to_find)
        ) return true;
        return false;
    }
    async getUsersAssessedContent(): Promise <User[]> {
        await this.checkData();
        const users = await mongoAssessments.aggregate(
      [
          {
            '$lookup': {
              'from': 'contents', 
              'localField': 'cid', 
              'foreignField': '_id', 
              'as': 'content'
            }
          }, {
            '$match': {
              'content.organizationid': this.uid
            }
          }, {
            '$group': {
              '_id': '$uid', 
              'assessedcount': {
                '$count': {}
              }
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': '_id', 
              'foreignField': '_id', 
              'as': 'user'
            }
          }, {
            '$unwind': {
              'path': '$user'
            }
          }, {
            '$addFields': {
              'user.assessedcount': '$assessedcount'
            }
          }, {
            '$replaceRoot': {
              'newRoot': '$user'
            }
          }, {
            '$sort': {
              'assessedcount': -1
            }
          }
        ]);
        return users;
  } 

}