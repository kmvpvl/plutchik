import React from 'react';
import './loginForm.css';
import { serverFetch } from '../common';

export type LoginFormStates = 'connecting' | 'connected' | 'revealing_auth_code' | 'logging' | 'logged' | 'error';

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

interface ILoginForm {
    onStateChanged?: (oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo)=>void;
}

interface ILoginFormState {
    state: LoginFormStates;
}

export default class TGLogin extends React.Component<ILoginForm, ILoginFormState> {
    tgUserIdRef: React.RefObject<HTMLInputElement>;
    tgAuthCode: React.RefObject<HTMLInputElement>;
    serverInfo: IServerInfo;
    constructor(props: any) {
        super(props);
        this.tgUserIdRef = React.createRef();
        this.tgAuthCode = React.createRef();
        const tgUI = localStorage.getItem('tgUserId');
        const st = localStorage.getItem('sessiontoken');
        this.serverInfo = {};
        this.serverInfo.tguserid = tgUI?parseInt(tgUI):undefined;
        this.serverInfo.sessiontoken = st?st:undefined;
        this.state = {
            state: 'connecting'
        }
    }
    componentDidMount(): void {
        this.getServerVersion();
    }
    changeState(newState: LoginFormStates){
        const oldState = this.state.state;
        this.setState({state:newState});
        if (this.props.onStateChanged) this.props.onStateChanged(oldState, newState, this.serverInfo);
    }
    getServerVersion(){
        serverFetch('version', 'GET', undefined, undefined,
            res=>{
                this.serverInfo.version = res;
                this.changeState('connected');
                if (this.serverInfo.tguserid && this.serverInfo.sessiontoken) this.changeState('logged');
            },
            v=>this.changeState('error')
        );
    }
    getAuthCode() {
        const tgUI = this.tgUserIdRef.current?.value;
        if (tgUI) localStorage.setItem('tgUserId', tgUI);
        serverFetch(`telegram?command=create_auth_code&tg_user_id=${tgUI}`,'GET', undefined, undefined,
            res=>this.changeState('revealing_auth_code'),
            v=>this.changeState('error')
        );
    }
    login() {
        this.changeState('logging');
        if (!this.tgUserIdRef.current || !this.tgAuthCode.current) return;
        //debugger;
        const tgUI = this.tgUserIdRef.current.value;
        const tgAC = this.tgAuthCode.current.value;
        serverFetch(`tggetsessiontoken`, 'GET', { 
                tg_userid: tgUI,
                tg_auth_code: tgAC
            }, undefined,
            res=>{
                this.serverInfo.sessiontoken = res;
                localStorage.setItem('sessiontoken', res);
                this.changeState('logged')
            },
            v=>this.changeState('error')
        );
    }
    render(): React.ReactNode {
        const state = this.state.state;
        return (
            <div>
                <span>{this.state.state}</span>
                {'connecting' !== state ? <span>{JSON.stringify(this.serverInfo.version)}</span>:<></>}
                {'error' === state ? <button onClick={()=>this.getServerVersion()}>Retry</button>:<></>}
                {'connecting' !== state && 'logged' !== state && 'error' !== state ? <input type="text" placeholder='Telegram user id' ref={this.tgUserIdRef} value={this.serverInfo.tguserid}/>:<></>}
                {'connecting' !== state && 'logged' !== state && 'error' !== state ? <button onClick={()=>this.getAuthCode()}>Get code</button>:<></>}
                {'revealing_auth_code' === state || 'logging' === state ? <input type="password" placeholder='Code from bot' ref={this.tgAuthCode}/>:<></>}
                {'revealing_auth_code' === state || 'logging' === state ? <button onClick={()=>this.login()}>OK</button>:<></>}
                {'logged' === state ? <button>Sign out</button>:<></>}
            </div>
        );
    }
}

