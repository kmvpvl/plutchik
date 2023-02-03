import OpenAPIBackend from 'openapi-backend';
import express, { Application, Request, Response } from "express";
import morgan from "morgan";
import cors from 'cors';
import version from './api/version';
import adduser from './api/adduser';
import getsessiontoken from './api/getsessiontoken';
import blockuser from './api/blockuser';
import addcontent from './api/addcontent';
import blockcontent from './api/blockcontent';
import addassessment from './api/addassessment';
import addorganizationkey from './api/addorganizationkey';
import organizationkeyslist from './api/organizationkeyslist';
import removeorganizationkey from './api/removeorganizationkey';
import createorganization from './api/createorganization';

const PORT = process.env.PORT || 8000;

function checkSecurity(c: any): boolean {
    try{
        //const user = new User(c.request);
        return true; 
    } catch(e){
        return false;
    }
}

const api = new OpenAPIBackend({ 
    definition: 'plutchikAPI.yml'
});
api.init();
api.register({
    version:    async (c, req, res) => version(c, req, res),
    createorganization: async (c, req, res) => createorganization(c, req, res),
    getsessiontoken:    async (c, req, res) => getsessiontoken(c, req, res),
    adduser:    async (c, req, res) => adduser(c, req, res),
    addorganizationkey:    async (c, req, res) => addorganizationkey(c, req, res),
    organizationkeyslist:    async (c, req, res) => organizationkeyslist(c, req, res),
    removeorganizationkey: async (c, req, res) => removeorganizationkey(c, req, res),
    blockuser:    async (c, req, res) => blockuser(c, req, res),
    unblockuser:    async (c, req, res) => blockuser(c, req, res, false),
    addcontent:    async (c, req, res) => addcontent(c, req, res),
    blockcontent:    async (c, req, res) => blockcontent(c, req, res),
    unblockcontent:    async (c, req, res) => blockcontent(c, req, res, false),
    addassessment:    async (c, req, res) => addassessment(c, req, res),
    validationFail: (c, req, res) => res.status(400).json({ err: c.validation.errors }),
    notFound: (c, req, res) => res.status(404).json({ code: 'Command not found', description: "Command not found" }),
    notImplemented: (c, req, res) => res.status(500).json({ err: 'not found' }),
    unauthorizedHandler: (c, req, res) => res.status(401).json({ err: 'not auth' })
});
api.registerSecurityHandler('PlutchikAuthOrganizationId',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthOrganizationKey',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthUserId',  checkSecurity);
api.registerSecurityHandler('PlutchikAuthSessionToken',  checkSecurity);


export const app: Application = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

// use as express middleware
app.use(async (req: Request, res: Response) => {
    try {
        return await api.handleRequest({
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query as {[key: string]: string},
        headers: req.headers as {[key: string]: string}
        }, 
        req, res);
    } catch (e){
        return res.status(500).json({code: "Wrong parameters", description: `Request ${req.url}- ${(e as Error).message}`});
    }
});
export const server = app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});