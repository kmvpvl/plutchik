import React, { RefObject } from 'react';
import './App.css';
import TGLogin, {LoginFormStates } from './components/loginForm/loginForm';
import './model/common';
import { IServerInfo, PlutchikError } from './model/common';
import Pending from './components/pending/pending';
import User from './components/user/user';

interface IAppState {
    logged: boolean;
    serverInfo: IServerInfo;
    userInfo?: any;
    orgs?: any[];
    currentOrg?: string;
}

export default class App extends React.Component <{}, IAppState> {
    state: IAppState = {
        logged: false,
        serverInfo: {
            version: undefined,
            error: undefined,
            tguserid: undefined,
            sessiontoken: undefined,
        },
        userInfo: {},
        currentOrg: undefined,
        orgs: [],
    }
    messagesRef: RefObject<Infos> = React.createRef();
    pendingRef: RefObject<Pending> = React.createRef();

    public onLoginStateChanged(oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo) {
        const nState: IAppState = this.state;
        nState.logged = newState === 'logged';
        nState.serverInfo = info;
        nState.userInfo = {};
        this.setState(nState);
    }

    public onUILoaded(ui: any) {
        const nState: IAppState = this.state;
        nState.userInfo = ui;
        this.setState(nState);
    }
    onError(error: PlutchikError) {
        this.displayError(error);
    }
    onNewOrgCreated(org: any) {
    }
    displayInfo(text: string) {
        const s = this.messagesRef.current?.state;
        if (s) {
            const n = s.infos.push(text as never);
            this.messagesRef.current?.setState(s);
            setTimeout(()=>{
                const s = this.messagesRef.current?.state;
                if (s) {
                    s.infos.splice(n-1, 1);
                    this.messagesRef.current?.setState(s);
                }
            }, 1500);
        }
    }

    displayError(err: PlutchikError) {
        const s = this.messagesRef.current?.state;
        if (s) {
            (s.errors as PlutchikError[]).push(err);
            this.messagesRef.current?.setState(s);
        }
    }

    
    render(): React.ReactNode {
        return (
        <div className='app-container'>
            <TGLogin pending={this.pendingRef} onStateChanged={(oldState: LoginFormStates, newState: LoginFormStates, info:IServerInfo)=>this.onLoginStateChanged(oldState, newState, info)} onUserInfoLoaded={ui=>this.onUILoaded(ui)} onError={(err)=>this.displayError(err)}/>
            <User userInfo={this.state.userInfo} serverInfo={this.state.serverInfo}></User>
            <Infos ref={this.messagesRef}/>
            <Pending ref={this.pendingRef}/>
        </div>
        );
    }
}

interface IInfosProps {
}

interface IInfoState {
    infos: string[];
    errors: PlutchikError[];
}

class Infos extends React.Component<IInfosProps, IInfoState> {
    state = {
        infos: [],
        errors: []
    }
    render(): React.ReactNode {
        return (<div>
            {this.state.infos.map((v: any, i) => (<div id={`infos_${i}`} className='info' key={`infos_${i}`} onClick={(e)=>{
                const n = parseInt(e.currentTarget.id.split('_')[1]);
                const s = this.state;
                s.infos.splice(n, 1);
                this.setState(s);
            }}>{v}</div>))}
            {this.state.errors.map((v: any, i) => (<div id={`errors_${i}`} className='error' key={`errors_${i}`} onClick={(e)=>{
                const n = parseInt(e.currentTarget.id.split('_')[1]);
                const s = this.state;
                s.errors.splice(n, 1);
                this.setState(s);
            }}>{v.message}</div>))}
        </div>);
    }
}