import { Types, Schema, model } from "mongoose";
import colours from "./colours";
import PlutchikError from "./error";
import MongoProto from "./mongoproto";

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
    assignid?: Types.ObjectId;
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
    assignid: {type: Types.ObjectId, required: false},
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

export default class Assessment extends MongoProto<IAssessment> {
    constructor(id?: Types.ObjectId, data?: IAssessment){
        super(mongoAssessments, id, data);
    }
}