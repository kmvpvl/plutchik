export function serverFetch(command: string, method: string, headers?: HeadersInit, body?: BodyInit, successcb?: (res: any)=>void, failcb?: (res: any)=>void) {
    fetch(`http://localhost:8000/${command}`,{
        method: method,
        headers: headers,
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