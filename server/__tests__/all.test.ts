import Request from 'supertest';
import {app, server} from '../server';
import {describe, expect, jest, it, beforeAll} from '@jest/globals';
jest.setTimeout(15000);

beforeAll(() => {
    //jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    //jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());
});

describe("TEST: VERSION", ()=>{
    it("version", async () => {
        const responseVersion = await Request(app)["get"]("/version")
            .set('Content-Type', 'application/json')
            .send();

        expect(responseVersion.statusCode).toBe(200);
        expect(responseVersion.body.api).toBe("1.0.0");
    });
});
describe("TEST: Organization, content and user management", ()=>{
    let responseCreateorganization: any;
    let responseKeyManageUsers: any;
    let responseKeyManageContent: any;
    let responseKeyManageWrong: any;
    let responseOrganizationkeyslist: any;
    let responseKeyManageContentToDelete: any;
    let responseDeleteKey: any;
    let responseAddContent: any;
    let responseBlockContent: any;
    let responseAddUser: any;
    let responseBlockUser: any;
    let responseToken: any;
    let responseKeyManageToken: any;
    let responseAssessment: any;
    let responseOrganizationinfo: any;

    it("createorganization:success", async () => {
        responseCreateorganization = await Request(app)["post"]("/createorganization")
            .set('Content-Type', 'application/json')
            .send({
                "name": "Test1",
                "emails": ["test@test.test"]
            });

        expect(responseCreateorganization.statusCode).toBe(200);
        expect("organizationid" in responseCreateorganization.body && /^[0-9a-fA-F]{24}$/.test(responseCreateorganization.body.organizationid)).toBe(true);
        expect("organizationkey" in responseCreateorganization.body && /^[0-9a-fA-F]{24}$/.test(responseCreateorganization.body.organizationkey)).toBe(true);
    });

    it("addorganizationkeyusers:success", async () => {
            responseKeyManageUsers = await Request(app)["post"]("/addorganizationkey")
            .set('Content-Type', 'application/json')
            .set('organizationid', responseCreateorganization.body.organizationid)
            .set('organizationkey', responseCreateorganization.body.organizationkey)
            .send({
                "name": "David Rhuxel",
                "roles": ["manage_users"]
            });

        expect(responseKeyManageUsers.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseKeyManageUsers.body)).toBe(true);
    });

    it("addorganizationkeycontent:success", async () => {
        responseKeyManageContent = await Request(app)["post"]("/addorganizationkey")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "name": "Miroslaw Visek",
            "roles": ["manage_content"]
        });

        expect(responseKeyManageContent.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseKeyManageContent.body)).toBe(true);
    });

    it("addorganizationkeytoken:success", async () => {
        responseKeyManageToken = await Request(app)["post"]("/addorganizationkey")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "name": "Make sessions with assessment (non-personal)",
            "roles": ["mining_session", "create_assessment"]
        });

        expect(responseKeyManageToken.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseKeyManageToken.body)).toBe(true);
    });

    it("addorganizationkeycontent:success", async () => {
        responseKeyManageContentToDelete = await Request(app)["post"]("/addorganizationkey")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "name": "To delete",
            "roles": ["manage_content"]
        });

        expect(responseKeyManageContentToDelete.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseKeyManageContentToDelete.body)).toBe(true);
    });

    it("addorganizationkey:fail", async () => {
        responseKeyManageWrong = await Request(app)["post"]("/addorganizationkey")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageContent.body)
        .send({
            "name": "Miroslaw Visek",
            "roles": ["manage_content"]
        });

        expect(responseKeyManageWrong.statusCode).toBe(401);
    });

    it("organizationkeyslist:success", async () => {
        responseOrganizationkeyslist = await Request(app)["get"]("/organizationkeyslist")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send();

        expect(responseOrganizationkeyslist.statusCode).toBe(200);
        expect(Array.isArray(responseOrganizationkeyslist.body)).toBe(true);
    });

    it("organizationinfo:success", async () => {
        responseOrganizationinfo = await Request(app)["get"]("/organizationinfo")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send();

        expect(responseOrganizationinfo.statusCode).toBe(200);
        expect(responseOrganizationinfo.body.keyscount).toBe(5);
    });

    it("removeorganizationkey:success", async () => {
        responseDeleteKey = await Request(app)["post"]("/removeorganizationkey")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "id": responseOrganizationkeyslist.body.length - 1
        });

        expect(responseDeleteKey.statusCode).toBe(200);
    });
    
    it("addcontent:fail", async () => {
        responseAddContent = await Request(app)["post"]("/addcontent")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "contentinfo": {
                "type": "memes",
                "url": "https://i.ytimg.com/vi/NbpdFJrothU/maxresdefault.jpg",
                "name": "TH sound",
                "tags": [],
                "description": "When your teacher explains how to pronounce TH",
                "language": "English",
                "restrictions": [],
                "blocked": "false"
            }
        });

        expect(responseAddContent.statusCode).toBe(401);
    });

    it("addcontent:success", async () => {
        responseAddContent = await Request(app)["post"]("/addcontent")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageContent.body)
        .send({
            "contentinfo": {
                "type": "memes",
                "url": "https://i.ytimg.com/vi/NbpdFJrothU/maxresdefault.jpg",
                "name": "TH sound",
                "tags": [],
                "description": "When your teacher explains how to pronounce TH",
                "language": "English",
                "restrictions": [],
                "blocked": "false"
            }
        });

        expect(responseAddContent.statusCode).toBe(200);
    });
    
    it("blockcontent:success", async () => {
        responseBlockContent = await Request(app)["get"](`/blockcontent/${responseAddContent.body._id}`)
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageContent.body)
        .send();

        expect(responseBlockContent.statusCode).toBe(200);
    });
    it("adduser:fail", async () => {
        responseAddUser = await Request(app)["post"]("/adduser")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseCreateorganization.body.organizationkey)
        .send({
            "userinfo": {
                "birthdate": "1972-07-23",
                "nativelanguage": "English",
                "secondlanguages": ["French", "Ukrain"],
                "location": "Prague",
                "gender": "male",
                "maritalstatus": "single",
                "features": "extra",
                "blocked": "false"
            }
        });

        expect(responseAddUser.statusCode).toBe(401);
    });

    it("adduser:success", async () => {
        responseAddUser = await Request(app)["post"]("/adduser")
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageUsers.body)
        .send({
            "userinfo": {
                "birthdate": "1972-07-23",
                "nativelanguage": "English",
                "secondlanguages": ["French", "Ukrain"],
                "location": "Prague",
                "gender": "male",
                "maritalstatus": "single",
                "features": "extra",
                "blocked": "false"
            }
        });

        expect(responseAddUser.statusCode).toBe(200);
        expect("_id" in responseAddUser.body).toBe(true);
        expect(/^[0-9a-fA-F]{24}$/.test(responseAddUser.body._id)).toBe(true)
    });
    
    it("blockuser:success", async () => {
        responseBlockUser = await Request(app)["get"](`/blockuser`)
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageUsers.body)
        .set('userid', responseAddUser.body._id)
        .send();

        expect(responseBlockUser.statusCode).toBe(200);
    });

    it("getsessiontoken:fail", async () => {
        responseToken = await Request(app)["get"](`/getsessiontoken`)
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageUsers.body)
        .set('userid', responseAddUser.body._id)
        .send();

        expect(responseToken.statusCode).toBe(401);
    });
    
    it("getsessiontoken:success", async () => {
        responseToken = await Request(app)["get"](`/getsessiontoken`)
        .set('Content-Type', 'application/json')
        .set('organizationid', responseCreateorganization.body.organizationid)
        .set('organizationkey', responseKeyManageToken.body)
        .set('userid', responseAddUser.body._id)
        .send();

        expect(responseToken.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseToken.body)).toBe(true)
    });

    it("addassessment:success", async () => {
        responseAssessment = await Request(app)["post"](`/addassessment`)
        .set('Content-Type', 'application/json')
        .set('userid', responseAddUser.body._id)
        .set('sessiontoken', responseToken.body)
        .send({
            "assessmentinfo": {
                "cid": responseAddContent.body._id,
                "vector": {
                    "joy": 0.5,
                    "trust": 0.6
                }
            }
        });

        expect(responseAssessment.statusCode).toBe(200);
        expect(/^[0-9a-fA-F]{24}$/.test(responseAssessment.body._id)).toBe(true)
    });
});
server.close();
