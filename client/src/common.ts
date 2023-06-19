export type ErrorCode = "notauth" | "rolerequired" | "servernotresponding" | "badrequest" | "unknown";
export class PlutchikError extends Error{
    code: ErrorCode;
    constructor (code: ErrorCode, message: string){
        super(`${code} - ${message}`);
        this.code = code;
    }
} 
export type TServerVersion = {
    api: string;
    data: string;
    ai: string;
}

export interface IServerInfo {
    version?: TServerVersion;
    error?: {
        code: string;
        description: string;
    };
    tguserid?: number;
    sessiontoken?: string;
}

console.log(JSON.stringify(process.env));
export function serverFetch(command: string, method: string, headers?: HeadersInit, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (err: PlutchikError)=>void) {
    const h: Headers = new Headers([
        ['Access-Control-Allow-Origin', '*'],
        ["ngrok-skip-browser-warning", "any"],
        ["Content-Type", "application/json"]
    ]);
    if (headers) {
        const oheaders = new Headers(headers);
        for (const [h1, h2] of oheaders.entries()) {
            h.append(h1, h2);
        }
    }    
    fetch(`${process.env.REACT_APP_SERVER_BASE_URL}/${command}`,{
        method: method,
        headers: h,
        body: body
    }).then(res=>{
        if (!res.ok) return Promise.reject(res);
        return res.json()})
    .then((v)=>{
        if (successcb) successcb(v);
    })
    .catch((v)=>{
        if (v instanceof Error) {
            if (failcb) failcb(new PlutchikError("servernotresponding", `command='${command}'; error='${v.message}'`));
        } else {
            const j = v.json();
            let err;
            switch (v.status){
                case 500:
                case 400: err = new PlutchikError("badrequest", `command='${command}; server_desc='${JSON.stringify(j)}'`);
                break;
                case 401: err = new PlutchikError("notauth", `command='${command}; server_desc='${JSON.stringify(j)}'`);
                break;
                case 403: err = new PlutchikError("rolerequired", `command='${command}'; server_desc='${JSON.stringify(j)}'`);
                break; 
                default: err = new PlutchikError("unknown", `command='${command}; server_desc='${JSON.stringify(j)}'`);
            }
            if (failcb) failcb(err);
        }
    });
}

export function serverCommand (command: string, si: IServerInfo, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (err: PlutchikError)=>void){
    serverFetch(command, 'POST', {
        plutchik_tguid: si.tguserid?si.tguserid.toString():'',
        plutchik_sessiontoken: si.sessiontoken?si.sessiontoken:''
    }, body, successcb, failcb);
}