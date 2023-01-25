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
//import User from "../model/user";
const colours_1 = __importDefault(require("../model/colours"));
const version_json_1 = __importDefault(require("../version.json"));
function version(c, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //    const factoryid = new Types.ObjectId(c.request.params["factoryid"]);
        console.log(`${colours_1.default.fg.green}API: version function${colours_1.default.reset}`);
        try {
            return res.status(200).json(version_json_1.default);
        }
        catch (e) {
            return res.status(400).json(e);
        }
    });
}
exports.default = version;
