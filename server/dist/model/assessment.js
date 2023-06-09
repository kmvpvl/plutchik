"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoAssessments = exports.AssessmentSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
exports.AssessmentSchema = new mongoose_1.Schema({
    uid: { type: mongoose_1.Types.ObjectId, required: false },
    organizationid: mongoose_1.Types.ObjectId,
    cid: mongoose_1.Types.ObjectId,
    assignid: { type: mongoose_1.Types.ObjectId, required: false },
    vector: {
        joy: { type: Number, required: false },
        trust: { type: Number, required: false },
        fear: { type: Number, required: false },
        surprise: { type: Number, required: false },
        disgust: { type: Number, required: false },
        sadness: { type: Number, required: false },
        anger: { type: Number, required: false },
        anticipation: { type: Number, required: false }
    },
    tags: { type: (Array), required: false },
    rating: { type: Number, required: false },
    created: Date
});
exports.mongoAssessments = (0, mongoose_1.model)('assessments', exports.AssessmentSchema);
class Assessment extends mongoproto_1.default {
    constructor(id, data) {
        super(exports.mongoAssessments, id, data);
    }
}
exports.default = Assessment;
