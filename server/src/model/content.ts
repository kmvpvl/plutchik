import mongoose, { Types, Schema, model } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import colours from "./colours";
import PlutchikError from "./error";
import { MLString, MLStringSchema } from "./mlstring";
import MongoProto from "./mongoproto";

export type ContentTypes = "text" | "image" | "audio" | "video";
export type SourceType = "web" | "telegram" | "youtube" | "embedded";
export interface IContent {
    _uid?: Types.ObjectId;
    type: ContentTypes;
    source: SourceType;
    tgData?: TelegramBot.Update;
    url?: string;
    name: MLString;
    tags: Array<string>;
    description: MLString;
    language: string;
    restrictions: Array<string>;
    organizationid?: Types.ObjectId;
    foruseronlyidref?: Types.ObjectId;
    assignid?: Types.ObjectId;
    blocked: boolean;
    expired?: Date;
    validfrom?: Date;
    created: Date;
    changed?: Date;
}

export interface IContentGroup {
    _uid?: Types.ObjectId;
    name: string;
    items: Array<Types.ObjectId>;
    tags?: Array<string>;
    description?: string;
    language: string;
    restrictions?: Array<string>;
    organizationid?: Types.ObjectId;
    foruseronlyidref?: Types.ObjectId;
    blocked: boolean;
    expired?: Date;
    validfrom?: Date;
    created: Date;
    changed?: Date;
}

export const ContentSchema = new Schema({
    organizationid: {type: Types.ObjectId, required: false},
    foruseronlyidref: {type: Types.ObjectId, required: false},
    name: {type: Schema.Types.Mixed, required: true},
    description: {type: Schema.Types.Mixed, required: true},
    language: {type: String, required: true},
    url: {type: String, required: false},
    type: {
        type: String,
        enum: ["text", "image", "audio", "video"],
        required: true
    },
    source: {
        type: String,
        enum: ["web", "telegram", "youtube", "embedded"],
        required: true
    },
    tgData: {
        type: Object, 
        required: false
    },
    tags: Array<string>,
    restrictions: Array<string>,
    blocked: Boolean,
    expired: {type: Date, required: false},
    validfrom: {type: Date, required: false},
    created: Date,
    changed: Date,
    history: Array<any>
});
export const ContentGroupSchema = new Schema({
    organizationid: {type: Types.ObjectId, required: false},
    foruseronlyidref: {type: Types.ObjectId, required: false},
    name: {type: String, required: true},
    items: {type: Array<Types.ObjectId>, required: true},
    description: {type: String, required: false},
    language: {type: String, required: true},
    tags: Array<string>,
    restrictions: Array<string>,
    blocked: Boolean,
    expired: {type: Date, required: false},
    validfrom: {type: Date, required: false},
    created: Date,
    changed: Date,
    history: Array<any>
});
export const mongoContent = model<IContent>('contents', ContentSchema);
export const mongoContentGroup = model<IContentGroup>('groups', ContentGroupSchema);

export default class Content extends MongoProto<IContent> {
    constructor(id?: Types.ObjectId, data?: IContent){
        super(mongoContent, id, data);
    }
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }
    public async assignGroups(groups: Array<string>) {
        await this.checkData();
        //lets check all prev groups
        let oldGroups = await mongoContentGroup.aggregate([
            {'$match': {
                'items':this.uid
            }},
            {'$project': {
                '_id': 1
            }}
        ]);
        if (groups) {
            for (const [i, g] of Object.entries(groups)){
                let og: ContentGroup | undefined = await ContentGroup.findContentGroup(g as string);
                if (og) {
                    await og.addItem(this.uid as Types.ObjectId);
                    // if this group is in list of oldGroup, delete it from oldGroups
                    oldGroups = oldGroups.filter((el)=>!new Types.ObjectId((og as ContentGroup).uid).equals(el._id));
                } else {
                    og = new ContentGroup(undefined, {
                        name: g as string,
                        items:[this.uid as Types.ObjectId],
                        tags:[],
                        restrictions: [],
                        language: this.json?.language as string,
                        blocked: false,
                        created: new Date()
                    });
                    await og.save();
                }
            }
        }
        //must delete cid from any estimated group in oldGroups
        for (const [i, g] of Object.entries(oldGroups)) {
            const go = new ContentGroup(new Types.ObjectId(g._id as string));
            await go.load();
            await go.removeItem(this.uid as Types.ObjectId);
        }
    }
}

export class ContentGroup extends MongoProto<IContentGroup> {
    constructor(id?: Types.ObjectId, data?: IContentGroup){
        super(mongoContentGroup, id, data);
    }
    public async block(block: boolean = true) {
        await this.checkData();
        if (this.data) this.data.blocked = block;
        await this.save();
    }
    public async addItem(newItem: Types.ObjectId) {
        await this.checkData();
        if (this.data) {
            const oldItems = this.data.items.filter((i)=>i.equals(newItem));
            if (!oldItems.length) this.data.items.push(newItem);
        }
        await this.save();
    }
    public async removeItem(oldItem: Types.ObjectId){
        await this.checkData();
        if (this.data) {
            const woItem = this.data.items.filter((i)=>!i.equals(oldItem));
            this.data.items = woItem;
        }
        await this.save();
    }
    public static async findContentGroup(name: string): Promise<ContentGroup|undefined> {
        const group = await mongoContentGroup.aggregate([{
            '$match': {
                name: name
            }
        }]);
        return group.length?new ContentGroup(undefined, group[0]):undefined;
    }
}

