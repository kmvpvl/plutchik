"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
class MongoError extends Error {
    constructor(code, message) {
        super(`code: ${code} - ${message}`);
    }
}
class MongoProto {
    constructor(model, id, data) {
        this.model = model;
        if (id)
            this.id = id;
        if (data) {
            this.data = data;
            if (data["_id"])
                this.id = new mongoose_1.Types.ObjectId(data["_id"]);
        }
    }
    load(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data) {
                this.data = data;
                if (data["_id"])
                    this.id = new mongoose_1.Types.ObjectId(data["_id"]);
            }
            else {
                MongoProto.connectMongo();
                const data = yield this.model.aggregate([
                    { "$match": { "_id": this.id } }
                ]);
                if (1 !== data.length)
                    throw new MongoError("mongo:objectnotfoundbyid", `type='${this.constructor.name}'; _id='${this.id}'`);
                yield this.load(data[0]);
                yield this.checkData();
            }
        });
    }
    get uid() {
        if (this.id === undefined)
            throw new MongoError("mongo:datanotloaded", `cannot return uid type='${this.constructor.name}}'; data = '${JSON.stringify(this.data)}'`);
        return this.id;
    }
    static connectMongo() {
        let uri = process.env.mongouri;
        mongoose_1.default.set('strictQuery', false);
        (0, mongoose_1.connect)(uri)
            .catch((err) => {
            try {
                throw new MongoError("mongo:connect", `err=${err.message}; uri="${uri}"`);
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    get json() {
        return this.data;
    }
    checkData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data)
                throw new MongoError("mongo:datanotloaded", `type='${this.constructor.name}}'; id = '${this.id}'`);
        });
    }
    getHistoryInfo() {
        return {
            //user: this.user.name,
            changed: new Date(),
        };
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            MongoProto.connectMongo();
            yield this.checkData();
            if (this.data) {
                if (this.data && /*this.data.hasOwnProperty('created') &&*/ this.data.created === undefined)
                    this.data.created = new Date();
                this.data.changed = new Date();
                let h = this.getHistoryInfo();
                let history = new Array;
                //if (('history' in this.data)) history = (this.data as any).history;
                //history.push(h); 
                //(this.data as any).history = history;
            }
            if (this.id && this.data) {
                yield this.model.findByIdAndUpdate(this.id, this.data);
                console.log(`✅ Object data was successfully updated.  type='${this.constructor.name}'; id = '${this.id}'`);
            }
            else {
                const objectInserted = yield this.model.insertMany([this.data]);
                this.id = new mongoose_1.Types.ObjectId(objectInserted[0]._id);
                this.load(objectInserted[0]);
                console.log(`✅ New object was created. type='${this.constructor.name}'; id = '${this.id}'`);
            }
        });
    }
    clone() {
        let n = {};
        Object.assign(n, this.data);
        delete n._id;
        delete n.history;
        n.created = new Date();
        return n;
    }
}
exports.default = MongoProto;
