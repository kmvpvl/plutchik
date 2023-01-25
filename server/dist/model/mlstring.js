"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLStringSchema = void 0;
const mongoose_1 = require("mongoose");
exports.MLStringSchema = new mongoose_1.Schema({
    default: String,
    values: {
        type: Map,
        of: String,
    }
});
