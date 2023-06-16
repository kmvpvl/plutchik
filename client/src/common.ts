let s;
try {
    s = require("./settings.json");
    for (let v in s) {
        process.env[v] = s[v];
    }
} catch (err: any) {
    //console.log(`${colours.bg.red}${err.message}${colours.reset}`);
    s = undefined;
}
console.log(JSON.stringify(process.env));
export function serverFetch(command: string, method: string, headers?: HeadersInit, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (res: any)=>void) {
    const h: Headers = new Headers([
        ['Access-Control-Allow-Origin', '*'],
        ["ngrok-skip-browser-warning", "any"]
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
        try {
            v.json()
            .then((j: any)=>{
                console.log(j);
                if (failcb) failcb(j);
            })
        } catch(e: any) {
            console.log(v);
            if (failcb) failcb(v);
        }
    });
}