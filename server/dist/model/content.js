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
exports.findContentGroup = exports.ContentGroup = exports.mongoContentGroup = exports.mongoContent = exports.ContentGroupSchema = exports.ContentSchema = void 0;
const mongoose_1 = require("mongoose");
const mongoproto_1 = __importDefault(require("./mongoproto"));
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
exports.ContentGroupSchema = new mongoose_1.Schema({
    organizationid: { type: mongoose_1.Types.ObjectId, required: false },
    foruseronlyidref: { type: mongoose_1.Types.ObjectId, required: false },
    name: { type: String, required: true },
    items: { type: (Array), required: true },
    description: { type: String, required: false },
    language: { type: String, required: true },
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
exports.mongoContentGroup = (0, mongoose_1.model)('groups', exports.ContentGroupSchema);
class Content extends mongoproto_1.default {
    constructor(id, data) {
        super(exports.mongoContent, id, data);
    }
    block(block = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.blocked = block;
            yield this.save();
        });
    }
}
exports.default = Content;
class ContentGroup extends mongoproto_1.default {
    constructor(id, data) {
        super(exports.mongoContentGroup, id, data);
    }
    block(block = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data)
                this.data.blocked = block;
            yield this.save();
        });
    }
    addItem(newItem) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                const oldItems = this.data.items.filter((i) => i.equals(newItem));
                if (!oldItems.length)
                    this.data.items.push(newItem);
            }
            yield this.save();
        });
    }
    removeItem(oldItem) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkData();
            if (this.data) {
                const woItem = this.data.items.filter((i) => !i.equals(oldItem));
                this.data.items = woItem;
            }
            yield this.save();
        });
    }
}
exports.ContentGroup = ContentGroup;
function findContentGroup(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const group = yield exports.mongoContentGroup.aggregate([{
                '$match': {
                    name: name
                }
            }]);
        return group.length ? new ContentGroup(undefined, group[0]) : undefined;
    });
}
exports.findContentGroup = findContentGroup;
