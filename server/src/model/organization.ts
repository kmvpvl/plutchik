import { Schema, Types, model } from "mongoose";
import PlutchikError from "./error";
import {MLString, MLStringSchema} from "./mlstring";
import User, { IAssignOrg, IUser, RoleType } from "./user";
import colours from "./colours";
import TelegramBot from "node-telegram-bot-api";
import { IContent, mongoContent } from "./content";
import MongoProto from "./mongoproto";
import { IAssessment, mongoAssessments } from "./assessment";

export const DEFAULT_SESSION_DURATION = 10080;

export interface IParticipant {
    _id?: Types.ObjectId;
    uid: Types.ObjectId;
    created: Date;
    expired?: Date;
    roles: Array<RoleType>;
}
export interface IInvitationToAssess {
    _id: Types.ObjectId;
    whom_tguserid: TelegramBot.ChatId;
    from_tguserid: TelegramBot.ChatId;
    messageToUser: TelegramBot.Message;
    closed: boolean;
    closedDate?: Date;
}

export interface IResponseToInvitation {
    _id: Types.ObjectId;
    response_to: Types.ObjectId;
    acceptordecline: boolean;
    user_reply: TelegramBot.Update;
    created: Date;
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
    invitations?: Array<IInvitationToAssess>;
    responses_to_invitations?: Array<IResponseToInvitation>;
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
    invitations: {type: Array, require: false},
    responses_to_invitations: {type: Array, require: false},
    created: Date,
    changed: Date,
    history: Array<any>,
});
export const mongoOrgs = model<IOrganization>('organizations', OrganizationSchema);
export const mongoSessionTokens = model<ISessionToken>('sessiontokens', SessionTokenSchema);

export interface IOrganizationStats {
    assessments: IAssessment[];
    users: IUser[];
    contents: IContent[];
    organizations: IOrganization[];
}

export default class Organization extends MongoProto <IOrganization>{
    constructor(id?: Types.ObjectId, data?: IOrganization){
        super(mongoOrgs, id, data);
    }

    public async addParticipant(uid: Types.ObjectId, roles: Array<RoleType>) {
        //!!! check for supervisor. Nobody can set supervisor to anybody
        roles = roles.filter(v=>v !== 'supervisor');
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
        if (this.data) this.data.participants = this.data?.participants.filter((v)=>!uid.equals(v.uid));
        await this.save();
    }

    public async getParticipantRoles(uid: Types.ObjectId): Promise<Array<RoleType>> {
        await this.checkData();
        const p = this.data?.participants.filter(v=>uid.equals(v.uid));
        if (p && p.length === 1) return p[0].roles;
        throw new PlutchikError("organization:wrongtguserid", `organizationid='${this.uid}'; uid='${uid}'`)
    }

    public async logInvitation(i: IInvitationToAssess) {
        await this.checkData();
        if (this.data && this.data?.invitations === undefined) this.data.invitations = new Array();
        this.data?.invitations?.push(i);
        await this.save();
    }
    public async logResponseToInvitation(i: IResponseToInvitation) {
        await this.checkData();
        if (this.data && this.data?.responses_to_invitations === undefined) this.data.responses_to_invitations = new Array();
        this.data?.responses_to_invitations?.push(i);
        await this.save();
    }
    public async rename(newName: string) {
      await this.checkData();
      if (this.data) this.data.name = newName;
      await this.save();
    }

    public async closeInvitation(inv_id: Types.ObjectId) {
        await this.checkData();
        if (this.data) this.data.invitations?.forEach(v=>{if (v._id === inv_id) {
            v.closed = true;
            v.closedDate = new Date();
        }});
        await this.save();
    }

    public async getFirstLettersOfContentItems(): Promise<Array<string>> {
        await this.checkData();
        const letters = await mongoContent.aggregate([
            {'$match': {'organizationid': this.id, 'blocked': false}
            }, {'$project': {'l': {'$substrCP': ['$name', 0, 1]}}
            }, {'$group': {'_id': '$l', 'count': {'$sum': 1}}
            }, {'$sort': {'_id': 1}
            }
          ]);
        return letters;
    }
    public async getContentItems(): Promise<Array<IContent>> {
        await this.checkData();
        const ci = await mongoContent.aggregate([
            {'$match': {'organizationid': this.id}
            }, {'$lookup': {
                from: "groups",
                localField: "_id",
                foreignField: "items",
                as: "groups"}
            }, {'$sort': {
                changed: -1}
            }
        ]);
        return ci;
    }

    public async getContentItemsCount(): Promise<Array<IContent>> {
        await this.checkData();
        const ci = await mongoContent.aggregate([
            {'$match': {'organizationid': this.id, 'blocked': false}
            }, {'$count': "count"}
        ]);
        return ci[0].count;
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

    static async getOrganizationByInvitationId(inv_id: Types.ObjectId): Promise<Organization> {
        const orgs = await mongoOrgs.aggregate([
            {'$match': {'invitations._id': inv_id}}
        ]);
        if (orgs.length === 0) throw new PlutchikError("organization:notfound", `by invitation id = ${inv_id}`);
        const ret = new Organization(undefined, orgs[0]);
        await ret.load();
        return ret
    }
    //** Calc assign which referenced in assessment when user is assessing content of organization by invitation */
    //** @return IAssignOrg or undefined, may be throwed if ogranization object was broken */
    public async getUserAndAssignByInvitationId(inv_id: Types.ObjectId): Promise<{user: User; assign?: IAssignOrg}> {
        const found_inv = this.json?.invitations?.filter(v=>inv_id.equals(v._id));
        if (found_inv !== undefined && found_inv.length === 1) {
            // getting user who was invited
            const user = await User.getUserByTgUserId(parseInt(found_inv[0].whom_tguserid.toString()));
            if (user === undefined) {
                throw new PlutchikError("user:notfound", `Ivited user with TG ID = '${found_inv[0].whom_tguserid}' left`);
            }
            // finding responses to invitation with accepting
            const answers = this.json?.responses_to_invitations?.filter(v=>inv_id.equals(v.response_to) && v.acceptordecline);
            if (answers === undefined || answers.length === 0) {
                // user hasn't replied to invitation or declined
                return {user: user}
            } else {
                //finding last acceptance
                const last_answer = answers.reduce((p, cur)=>p.created.getTime()>cur.created.getTime()?p:cur);
                //getting from user assign object
                const assigns = user?.json?.assignedorgs?.filter(v=>v.response_to_invitation.equals(last_answer._id));
                if (assigns === undefined || assigns.length === 0) {
                    throw new PlutchikError("user:broken", `Expected assign to org with response_to_invitation = '${last_answer._id}'`)
                } else {
                    return {user: user, assign: assigns[0]};
                }
            }
        } else {
            throw new PlutchikError("organization:broken", `Invitation id = '${inv_id}' not found or not the only one`);
        }
    }
    public async stats(): Promise<IOrganizationStats> {
        await this.checkData();
        const content = mongoContent.aggregate([
            {$match: {"organizationid": this.uid}
            }
        ]);

        const assessments = mongoContent.aggregate([
            {'$match': {'organizationid': this.uid}
            }, {'$lookup': {
                'from': 'assessments', 
                'localField': '_id', 
                'foreignField': 'cid', 
                'as': 'assessment'}
            }, {'$match': {'$expr': {'$ne': ['$assessment', []]}}
            }, {'$project': {'assessment': 1}
            }, {'$unwind': {'path': '$assessment', 'preserveNullAndEmptyArrays': false}
            }, {'$replaceRoot': {'newRoot': '$assessment'}
            }
        ]);

        const users = mongoContent.aggregate([
            {'$match': {'organizationid': this.uid}
            }, {'$lookup': {
                'from': 'assessments', 
                'localField': '_id', 
                'foreignField': 'cid', 
                'as': 'assessment'}
            }, {'$match': {'$expr': {'$ne': ['$assessment', []]}}
            }, {'$project': {'assessment': 1}
            }, {'$unwind': {'path': '$assessment', 'preserveNullAndEmptyArrays': false}
            }, {'$lookup': {
                'from': 'users', 
                'localField': 'assessment.uid', 
                'foreignField': '_id', 
                'as': 'user'}
            }, {$group:{_id: "$user._id",user: {$first: "$user"}}
            }, {'$unwind': {'path': '$user', 'preserveNullAndEmptyArrays': false}
            }, {'$replaceRoot': {'newRoot': '$user'}
            }
          ]);

        const stats = await Promise.all([content, assessments, users]);
        
        return {
            users: stats[2],
            contents: stats[0],
            assessments: stats[1],
            organizations: [this.json as IOrganization],
        }
    }
}