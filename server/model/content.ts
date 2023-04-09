import { Types, Schema, model } from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import colours from "./colours";
import PlutchikError from "./error";
import { MLStringSchema } from "./mlstring";
import PlutchikProto from "./plutchikproto";

export type ContentTypes = "text" | "image" | "audio" | "video";
export type SourceType = "web" | "telegram" | "youtube";
export interface IContent {
    _uid?: Types.ObjectId;
    type: ContentTypes;
    source: SourceType;
    tgData?: Array<TelegramBot.Message>;
    url?: string;
    name: string;
    tags: Array<string>;
    description: string;
    language: string;
    restrictions: Array<string>;
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
    name: {type: String, required: true},
    description: {type: String, required: true},
    language: {type: String, required: true},
    url: {type: String, required: false},
    type: {
        type: String,
        enum: ["text", "image", "audio", "video"],
        required: true
    },
    source: {
        type: String,
        enum: ["web", "telegram", "youtube"],
        required: true
    },
    tgData: {
        type: Array, 
        required: function() {return this.source === 'telegram';},
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
export const mongoContent = model<IContent>('contents', ContentSchema);

export default class Content extends PlutchikProto<IContent> {
    public async load(data?: IContent) {
        PlutchikProto.connectMongo();
        if (!data) {
            const contents = await mongoContent.aggregate([
                {
                    '$match': {
                        '_id': this.id
                    } 
                }
            ]);
            if (1 != contents.length) throw new PlutchikError("content:notfound", `id = '${this.id}'`)
            await super.load(contents[0]);
        } else {
            await super.load(data);
        }
    }
    protected async checkData(): Promise<void> {
        if (!this.data) throw new PlutchikError("content:notloaded", `cid = '${this.id}'`);
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
            await mongoContent.findByIdAndUpdate(this.id, this.data);
            console.log(`Content itemt data was successfully updated. Content id = '${this.id}'`);
        } else { 
            const contentInserted = await mongoContent.insertMany([this.data]);
            this.id = contentInserted[0]._id;
            this.load(contentInserted[0]);
            console.log(`New content was created. ${colours.fg.blue}Cid = '${this.id}'${colours.reset}`);
        }
    }
}