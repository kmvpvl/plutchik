import React from 'react';
import './tgLogin.css';
interface ITGLogin {
    tg_user_id: string | number;
    auth_code: string;
    server_version?: {
        api: string;
        data: string;
        ai: string;
    };
}

interface ITGLoginState {
    loggedin: boolean
}

export function serverFetch(command: string) {
    return fetch(`${'https://plutchik.onrender.com'}/${command}`, {
      headers: {
      }
    });
  }
  

export default class TGLogin extends React.Component<ITGLogin, ITGLoginState> {
    getServerVersion(){
        fetch('https://plutchik.onrender.com/version',{
            method: 'GET'
        }).then(res=>{
            if (!res.ok) {
                console.log(res.status);
            } else {
                console.log(res.status);
            }
            return res.json();})
        .then((v)=>{
            console.log(`${JSON.stringify(v)}`);
            this.setState({loggedin: false});
        })
        .catch((v)=>{
            console.log("error =", v);
            //this.showError(v);
        });
;
    }
    render(): React.ReactNode {
        return (
            <div>
                <span>{JSON.stringify(this.props.server_version)}</span>
                <input type="text" placeholder='Telegram user id'/>
                <button onClick={()=>this.getServerVersion()}>Get code</button>
                <input type="password" placeholder='Code from bot'/>
                <button>OK</button>
                <button>Sign out</button>
            </div>
        );
    }
}

