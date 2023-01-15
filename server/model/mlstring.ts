import { Schema } from "mongoose";
export default interface IMLString {
    default: string;
    values?: Map<string, string>
}

export const MLStringSchema = new Schema({
    default: String,
    values: {
        type: Map,
        of: String,
    }
});
