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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const colours_1 = __importDefault(require("./colours"));
const error_1 = __importDefault(require("./error"));
let settings = {};
try {
    settings = require("../settings.json");
}
catch (err) {
    console.log(`${colours_1.default.bg.red}${err.message}${colours_1.default.reset}`);
    if (!process.env["mongouri"])
        throw new error_1.default("mongo:connect", `Environment variable 'mongouri' can't be read`);
    settings.mongouri = process.env["mongouri"];
}
class PlutchikProto {
    constructor(id, data) {
        if (id)
            this.id = id;
        if (data) {
            this.data = data;
            if (data["_id"])
                this.id = data["_id"];
        }
    }
    load(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data) {
                this.data = data;
                if (data["_id"])
                    this.id = data["_id"];
            }
            yield this.checkData();
        });
    }
    static connectMongo() {
        let uri = settings.mongouri;
        mongoose_1.default.set('strictQuery', false);
        (0, mongoose_1.connect)(uri)
            .catch((err) => {
            try {
                throw new error_1.default("mongo:connect", `err=${err.message}; uri="${uri}"`);
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
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getHistoryInfo() {
        return {
            //user: this.user.name,
            changed: new Date(),
        };
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data) {
                this.data.changed = new Date();
                let h = this.getHistoryInfo();
                let history = new Array;
                //if (('history' in this.data)) history = (this.data as any).history;
                //history.push(h); 
                //(this.data as any).history = history;
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
exports.default = PlutchikProto;
