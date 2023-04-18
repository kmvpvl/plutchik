import colours from "./colours";

export type ErrorCode = 
      "mongo:connect" /* Couldn'n connect to MongoDB*/ 
    | "mongo:any" /* */
    | "forbidden:rolerequiered" /* U need role doing this operation*/
    | "organization:notfound" /* Organization id not found*/
    | "organization:notloaded" /* Organization id not loaded*/
    | "organization:wrongkey" /* Organization has no that key*/
    | "organization:wrongtguserid" //, "Organization has no that telegram user id"],
    | "user:notfound" /* User id not found*/
    | "user:notloaded" /* User id not loaded*/
    | "user:hasnoactivesession" /* User has no active session*/
    | "user:multiplesession" /* User has session not only once*/
    | "user:nonextcontent" /* User has done all assessments*/
    | "content:notfound" /* Content id not found*/
    | "content:notloaded" /* Content id not loaded*/
    | "group:notfound" /* Content group id not found*/
    | "group:notloaded" /* Content group id not loaded*/
    | "assessment:notfound" /* assessment id not found*/
    | "assessment:notloaded" /* assessment id not loaded*/
    ;
export default class PlutchikError extends Error {
    public code: ErrorCode;
    public description: string;
    constructor(code: ErrorCode, description?: string){
        const descs = new Map<ErrorCode, string>([
            ["mongo:connect",  "Couldn'n connect to MongoDB"],
            ["forbidden:rolerequiered", "U need role doing this operation"], 
            ["organization:notfound", "Organization id not found"],
            ["organization:notloaded", "Organization id not loaded"],
            ["organization:wrongkey", "Organization has no that key"],
            ["organization:wrongtguserid", "Organization has no that telegram user id"],
            ["user:notfound", "User id not found"],
            ["user:notloaded", "User id not loaded"],
            ["user:hasnoactivesession", "User has no active session"],
            ["user:multiplesession", "User has more that one active session"],
            ["user:nonextcontent", "User has done all assessments"],
            ["content:notfound", "Content id not found"],
            ["content:notloaded", "Content id not loaded"],
            ["group:notfound", "Content group id not found"],
            ["group:notloaded", "Content group id not loaded"],
            ["assessment:notfound", "assessment id not found"],
            ["assessment:notloaded", "assessment id not loaded"],
        ]);
        super(`${descs.get(code)} - ${description}`);
        this.code = code;
        this.description = this.message;
        console.log(`${colours.fg.red}Error occured: code: ${code}; desc: ${description}${colours.reset}`);
    }
    toString(){return this.message}
}