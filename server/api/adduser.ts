import { Request, Response } from 'express';
import colours from '../model/colours';
//import { model, Schema, Model, Document, Mongoose, connect, Types } from 'mongoose';
import PlutchikError from '../model/error';
//import User from "../model/user";

export default async function adduser(c: any, req: Request, res: Response) {
//    const factoryid = new Types.ObjectId(c.request.params["factoryid"]);
    console.log(`${colours.fg.green}API: adduser function${colours.reset}`);
    console.log(c.request.query.userinfo);
    try {
        return res.status(200).json({});
    } catch (e: any) {
        return res.status(400).json(e);
    }
}