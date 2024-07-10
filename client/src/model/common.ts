export type ErrorCode = "notauth" | "rolerequired" | "servernotresponding" | "badrequest" | "unknown" | "notfound";
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
            v.json().then((j: any) =>{
                let errcode: ErrorCode;
                switch (v.status){
                    case 500:
                    case 400: errcode = "badrequest"
                    break;
                    case 401: errcode = "notauth"
                    break;
                    case 403: errcode = "rolerequired"
                    break; 
                    case 404: errcode = "notfound"
                    break; 
                    default: errcode = "unknown";
                }
                const err = new PlutchikError(errcode, `command='${command}; url='${v.url}'; status='${v.status}'; text='${v.statusText}'; server_desc='${JSON.stringify(j)}'`);
                if (failcb) failcb(err);
            })
            .catch((err: any)=> {
                debugger;
            });
        }
    });
}

export function serverCommand (command: string, si: IServerInfo, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (err: PlutchikError)=>void){
    serverFetch(command, 'POST', {
        "plutchik-tguid": si.tguserid?si.tguserid.toString():'',
        "plutchik-sessiontoken": si.sessiontoken?si.sessiontoken:''
    }, body, successcb, failcb);
}

export function relativeDateString(d: Date): string {
    const today = new Date().getTime();
    const changed = d.getTime();
    let delta = (today - changed)/1000;
    let deltastr = "just now";
    if (delta > 60) {
        delta = delta / 60;
        if (delta < 60) deltastr = `${Math.round(delta)} mins ago`
        else {
            delta = delta / 60;
            if (delta < 24) deltastr = `${Math.round(delta)} hours ago`
            else {
                delta = delta / 24;
                if (delta < 365) deltastr = `${Math.round(delta)} days ago`
                else deltastr = `More year ago`
            }
        }
    } 
    return deltastr
}

export enum Emotion {
    joy = 'joy',
    trust = 'trust',
    fear = 'fear',
    surprise = 'surprise',
    sadness = 'sadness',
    disgust = 'disgust',
    anger = 'anger',
    anticipation = 'anticipation'    
}

export type IEmotionalVector = {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;  
}

export class EmotionalVector implements IEmotionalVector {
    joy: number = 0;
    trust: number = 0;
    fear: number = 0;
    surprise: number = 0;
    sadness: number = 0;
    disgust: number = 0;
    anger: number = 0;
    anticipation: number = 0;  
    constructor(ev?: IEmotionalVector) {
        for (const i in Emotion) (this as any)[i] = ev === undefined?0:(ev as any)[i];            
    }
    mult(a: number) {
        const v = Object.entries(this as IEmotionalVector);
        for (const [i, f] of v) (this as any)[i] = f * a;
    }
    add(av: IEmotionalVector){
        const v = Object.entries(this as IEmotionalVector);
        for (const [i, f] of v) (this as any)[i] = f + (av as any)[i];
    }
}
