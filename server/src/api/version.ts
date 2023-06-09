import { Request, Response } from 'express';
import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError from '../model/error';
import colours from "../model/colours";
import MongoProto from '../model/mongoproto';
var npm_package_version = require('../../package.json').version;
const mongoVersion = model<{
    version: string
}>('version', new Schema({
    version: {
        type: String, 
        required: true
    }
}));

export default async function version(c: any, req: Request, res: Response) {
    console.log(`${colours.fg.green}API: version function${colours.reset}`);
    let v = '0.0.0';
    try {
        MongoProto.connectMongo();
        const mv = await mongoVersion.find();
        if (mv.length === 1) v = mv[0].version;
        return res.status(200).json({
            api: npm_package_version,
            data: v,
            ai: '0.0.0'
        });
    } catch (e: any) {
        return res.status(400).json(e);
    }
}