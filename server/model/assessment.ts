import { Types, Schema, model } from "mongoose";
import colours from "./colours";
import PlutchikError from "./error";
import PlutchikProto from "./plutchikproto";

export interface IVector {
    joy?: number;
    trust?: number;
    fear?: number;
    surprise?: number;
    disgust?: number;
    sadness?: number;
    anger?: number;
    anticipation?: number;
} 

export interface IAssessment {
    _id?: Types.ObjectId; // uniq ID of assessment
    uid?: Types.ObjectId; // user ID, required but may be undefined. userid posted by security schema of call
    organizationid: Types.ObjectId;
    cid: Types.ObjectId; // content ID
    vector: IVector,
    tags?: Array<string>; // tags from user
    rating?: number; // value of assessed content item for match with others
    created?: Date;
}

export const AssessmentSchema = new Schema({
    uid: {type: Types.ObjectId, required: false},
    organizationid: Types.ObjectId,
    cid: Types.ObjectId,
    vector: {
        joy: {type: Number, required: false},
        trust: {type: Number, required: false},
        fear: {type: Number, required: false},
        surprise: {type: Number, required: false},
        disgust: {type: Number, required: false},
        sadness: {type: Number, required: false},
        anger: {type: Number, required: false},
        anticipation: {type: Number, required: false}
    },
    tags: {type: Array<String>, required: false},
    rating: {type: Number, required: false},
    created: Date
});

export const mongoAssessments = model<IAssessment>('assessments', AssessmentSchema);

export default class Assessment extends PlutchikProto<IAssessment> {
    public async load(data?: IAssessment) {
        PlutchikProto.connectMongo();
        if (!data) {
            const assessments = await mongoAssessments.aggregate([
                {
                    '$match': {
                        '_id': this.id
                    } 
                }
            ]);
            if (1 != assessments.length) throw new PlutchikError("assessment:notfound", `id = '${this.id}'`)
            await super.load(assessments[0]);
        } else {
            await super.load(data);
        }
    }
    protected async checkData(): Promise<void> {
        if (!this.data) throw new PlutchikError("assessment:notloaded", `id = '${this.id}'`);
    }
    public async save() {
        PlutchikProto.connectMongo();
        await this.checkData();
        await super.save();
        if (this.id){
            await mongoAssessments.findByIdAndUpdate(this.id, this.data);
            console.log(`assessment data was successfully updated.  id = '${this.id}'`);
        } else { 
            const assessmentInserted = await mongoAssessments.insertMany([this.data]);
            this.id = assessmentInserted[0]._id;
            this.load(assessmentInserted[0]);
            console.log(`New assessment was created. ${colours.fg.blue}Cid = '${this.id}'${colours.reset}`);
        }
    }
}