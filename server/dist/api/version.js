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
const mongoose_1 = require("mongoose");
const colours_1 = __importDefault(require("../model/colours"));
const mongoproto_1 = __importDefault(require("../model/mongoproto"));
var npm_package_version = require('../../package.json').version;
const mongoVersion = (0, mongoose_1.model)('version', new mongoose_1.Schema({
    version: {
        type: String,
        required: true
    }
}));
function version(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`${colours_1.default.fg.green}API: version function${colours_1.default.reset}`);
        let v = '0.0.0';
        try {
            mongoproto_1.default.connectMongo();
            const mv = yield mongoVersion.find();
            if (mv.length === 1)
                v = mv[0].version;
            return res.status(200).json({
                api: npm_package_version,
                data: v,
                ai: '0.0.0'
            });
        }
        catch (e) {
            return res.status(400).json(e);
        }
    });
}
exports.default = version;
