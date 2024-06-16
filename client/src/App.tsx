import React, { RefObject } from 'react';
import './App.css';
import TGLogin, {LoginFormStates } from './components/loginForm/loginForm';
import './model/common';
import { IServerInfo, PlutchikError } from './model/common';
import Pending from './components/pending/pending';
import User from './components/user/user';
import Organizations from './components/manageOrgs/organizations';
import { Content } from './components/content/content';
import UserMng from './components/user/userMng';

type AppMode = "content" | "users";

interface IAppState {
    logged: boolean;
    serverInfo: IServerInfo;
    userInfo?: any;
    currentOrg?: string;
    mode?: string;
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
        mode: localStorage.getItem("plutchik_app_mode")?localStorage.getItem("plutchik_app_mode") as AppMode:"content"
    }
    private orgs: Array<any> = [];
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

    onModeChanged(newMode: string) {
        const nState: IAppState = this.state;
        localStorage.setItem("plutchik_app_mode", newMode);
        nState.mode = newMode;
        this.setState(nState);
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

    onOrgsListUpdated(orgs: any[]) {
        this.orgs = orgs;
        this.setState(this.state);
    }

    onUserMngOrgUpdated(org: any) {
        const foundEl = this.orgs.findIndex(v=>v._id === org._id);
        this.orgs[foundEl] = org;

    }
    
    render(): React.ReactNode {
        const current_org = this.orgs.filter(v=>v._id === this.state.currentOrg)[0];
        return <div className='app-container'>
            <TGLogin ref={this.loginRef} pending={this.pendingRef} onStateChanged={(oldState: LoginFormStates, newState: LoginFormStates, info:IServerInfo)=>this.onLoginStateChanged(oldState, newState, info)} onUserInfoLoaded={ui=>this.onUILoaded(ui)} onError={(err)=>this.displayError(err)}/>
            
            {this.state.logged?<User userInfo={this.state.userInfo} serverInfo={this.state.serverInfo} onLogoutClick={()=>this.loginRef.current?.logout()}></User>:<div/>}
            
            {this.state.logged?<Organizations mode={this.state.mode?this.state.mode:"content"} onSuccess={res=>this.displayInfo(res)} serverInfo={this.state.serverInfo} onOrgSelected={this.onOrgSelected.bind(this)} onError={err=>this.displayError(err)} onModeChanged={this.onModeChanged.bind(this)} onOrganizationListLoaded={this.onOrgsListUpdated.bind(this)}></Organizations>:<div/>}
            
            {this.state.logged?this.state.mode === "users"?this.state.currentOrg === undefined?<div></div>:
            <UserMng onOrgUpated={this.onUserMngOrgUpdated.bind(this)} serverInfo={this.state.serverInfo} org={current_org} onSuccess={res=>this.displayInfo(res)} onError={err=>this.displayError(err)} userid={this.state.userInfo._id}/>
            
            :this.state.currentOrg === undefined?<div></div>:
            
            <Content key={this.state.currentOrg} ref={this.contentRef} serverInfo={this.state.serverInfo} orgid={this.state.currentOrg} userid={this.state.userInfo._id} onSuccess={res=>this.displayInfo(res)} onError={err=>this.displayError(err)} pending={this.pendingRef}></Content>:<div/>}
            
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