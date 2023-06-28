import { Schema } from "mongoose";
export type MLString = string | {
    default: string;
    values?: Map<string, string>
}

export const MLStringSchema = new Schema({
    default: {type: String, required: true},
    values: {
        type: Map,
        of: String,
        required: false
    }
});
