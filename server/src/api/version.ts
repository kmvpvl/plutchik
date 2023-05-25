import { Request, Response } from 'express';
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError from '../model/error';
//import User from "../model/user";
import colours from "../model/colours";
import version_file  from "../version.json";
export default async function version(c: any, req: Request, res: Response) {
//    const factoryid = new Types.ObjectId(c.request.params["factoryid"]);
    console.log(`${colours.fg.green}API: version function${colours.reset}`);
    try {
        return res.status(200).json(version_file);
    } catch (e: any) {
        return res.status(400).json(e);
    }
}