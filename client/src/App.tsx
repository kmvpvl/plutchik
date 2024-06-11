import React, { RefObject } from 'react';
import './App.css';
import TGLogin, {LoginFormStates } from './components/loginForm/loginForm';
import './model/common';
import { IServerInfo, PlutchikError } from './model/common';
import Pending from './components/pending/pending';
import User from './components/user/user';
import Organizations from './components/manageOrgs/organizations';
import { Content } from './components/content/content';

type AppMode = "content" | "users";

interface IAppState {
    logged: boolean;
    serverInfo: IServerInfo;
    userInfo?: any;
    orgs?: any[];
    currentOrg?: string;
    mode?: AppMode;
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
        mode: localStorage.getItem("plutchik_app_mode")?localStorage.getItem("plutchik_app_mode") as AppMode:"content"
    }
    messagesRef: RefObject<Infos> = React.createRef();
    pendingRef: RefObject<Pending> = React.createRef();
    contentRef: RefObject<Content> = React.createRef();
    loginRef: RefObject<TGLogin> = React.createRef();

    private onLoginStateChanged(oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo) {
        const nState: IAppState = this.state;
        nState.logged = newState === 'logged';
        nState.serverInfo = info;
        this.setState(nState);
    }

    private onOrgSelected(orgid: string) {
        const nState: IAppState = this.state;
        nState.currentOrg = orgid;
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
        return <div className='app-container'>
            <TGLogin ref={this.loginRef} pending={this.pendingRef} onStateChanged={(oldState: LoginFormStates, newState: LoginFormStates, info:IServerInfo)=>this.onLoginStateChanged(oldState, newState, info)} onUserInfoLoaded={ui=>this.onUILoaded(ui)} onError={(err)=>this.displayError(err)}/>
            {this.state.logged?<User userInfo={this.state.userInfo} serverInfo={this.state.serverInfo} onLogoutClick={()=>this.loginRef.current?.logout()}></User>:<div/>}
            {this.state.logged?<Organizations serverInfo={this.state.serverInfo} onOrgSelected={this.onOrgSelected.bind(this)} onError={err=>this.displayError(err)}></Organizations>:<div/>}
            {this.state.logged?this.state.mode === "users"?<div></div>:this.state.currentOrg === undefined?<div></div>:<Content ref={this.contentRef} serverInfo={this.state.serverInfo} orgid={this.state.currentOrg} userid={this.state.userInfo._id} onSuccess={res=>this.displayInfo(res)} onError={err=>this.displayError(err)} pending={this.pendingRef}></Content>:<div/>}
            <Infos ref={this.messagesRef}/>
            <Pending ref={this.pendingRef}/>
        </div>;
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