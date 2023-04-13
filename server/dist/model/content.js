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
exports.mongoContent = exports.ContentSchema = void 0;
const mongoose_1 = require("mongoose");
const colours_1 = __importDefault(require("./colours"));
const error_1 = __importDefault(require("./error"));
const plutchikproto_1 = __importDefault(require("./plutchikproto"));
exports.ContentSchema = new mongoose_1.Schema({
    organizationid: { type: mongoose_1.Types.ObjectId, required: false },
    foruseronlyidref: { type: mongoose_1.Types.ObjectId, required: false },
    name: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    url: { type: String, required: false },
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
    tags: (Array),
    restrictions: (Array),
    blocked: Boolean,
    expired: { type: Date, required: false },
    validfrom: { type: Date, required: false },
    created: Date,
    changed: Date,
    history: (Array)
});
exports.mongoContent = (0, mongoose_1.model)('contents', exports.ContentSchema);
class Content extends plutchikproto_1.default {
    load(data) {
        const _super = Object.create(null, {
            load: { get: () => super.load }
        });
        return __awaiter(this, void 0, void 0, function* () {
            plutchikproto_1.default.connectMongo();
            if (!data) {
                const contents = yield exports.mongoContent.aggregate([
                    {
                        '$match': {
                            '_id': this.id
                        }
                    }
                ]);
                if (1 != contents.length)
                    throw new error_1.default("content:notfound", `id = '${this.id}'`);
                yield _super.load.call(this, contents[0]);
            }
            else {
                yield _super.load.call(this, data);
            }
        });
    }
    checkData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data)
                throw new error_1.default("content:notloaded", `cid = '${this.id}'`);
        });
    }
    block(block = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.blocked = block;
            yield this.save();
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
                yield exports.mongoContent.findByIdAndUpdate(this.id, this.data);
                console.log(`Content itemt data was successfully updated. Content id = '${this.id}'`);
            }
            else {
                const contentInserted = yield exports.mongoContent.insertMany([this.data]);
                this.id = contentInserted[0]._id;
                this.load(contentInserted[0]);
                console.log(`New content was created. ${colours_1.default.fg.blue}Cid = '${this.id}'${colours_1.default.reset}`);
            }
        });
    }
}
exports.default = Content;
