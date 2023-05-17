"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoAssessments = exports.AssessmentSchema = void 0;
const mongoose_1 = require("mongoose");
const colours_1 = __importDefault(require("./colours"));
const error_1 = __importDefault(require("./error"));
const plutchikproto_1 = __importDefault(require("./plutchikproto"));
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
class Assessment extends plutchikproto_1.default {
    load(data) {
        const _super = Object.create(null, {
            load: { get: () => super.load }
        });
        return __awaiter(this, void 0, void 0, function* () {
            plutchikproto_1.default.connectMongo();
            if (!data) {
                const assessments = yield exports.mongoAssessments.aggregate([
                    {
                        '$match': {
                            '_id': this.id
                        }
                    }
                ]);
                if (1 != assessments.length)
                    throw new error_1.default("assessment:notfound", `id = '${this.id}'`);
                yield _super.load.call(this, assessments[0]);
            }
            else {
                yield _super.load.call(this, data);
            }
        });
    }
    checkData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data)
                throw new error_1.default("assessment:notloaded", `id = '${this.id}'`);
        });
    }
    save() {
        const _super = Object.create(null, {
            save: { get: () => super.save }
        });
        return __awaiter(this, void 0, void 0, function* () {
            plutchikproto_1.default.connectMongo();
            yield this.checkData();
            yield _super.save.call(this);
            if (this.id) {
                yield exports.mongoAssessments.findByIdAndUpdate(this.id, this.data);
                console.log(`assessment data was successfully updated.  id = '${this.id}'`);
            }
            else {
                const assessmentInserted = yield exports.mongoAssessments.insertMany([this.data]);
                this.id = new mongoose_1.Types.ObjectId(assessmentInserted[0]._id);
                this.load(assessmentInserted[0]);
                console.log(`New assessment was created. ${colours_1.default.fg.blue}Cid = '${this.id}'${colours_1.default.reset}`);
            }
        });
    }
}
exports.default = Assessment;
