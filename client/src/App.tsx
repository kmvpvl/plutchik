import React, { RefObject } from 'react';
import './App.css';
import TGLogin, {LoginFormStates } from './components/loginForm/loginForm';
import './model/common';
import { IServerInfo, PlutchikError, serverCommand } from './model/common';
import Pending from './components/pending/pending';
import User from './components/user/user';
import Organizations from './components/manageOrgs/organizations';
import { Content } from './components/content/content';
import UserMng from './components/user/userMng';
import Stats from './components/stats/stats';

export type AppMode = "content" | "edit set name" | "users" | "stats";

interface IAppState {
    logged: boolean;
    serverInfo: IServerInfo;
    userInfo?: any;
    currentOrg?: string;
    currentOrgStats?: any;
    mode?: AppMode;
    orgs: any[];
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
        nState.currentOrgStats = undefined;
        this.loadOrganizationStats();
        this.setState(nState);
    }

    public onUILoaded(ui: any) {
        const nState: IAppState = this.state;
        nState.userInfo = ui;
        this.setState(nState);
        this.loadOrganizations();
    }
    loadOrganizations() {
        this.pendingRef?.current?.incUse();
        serverCommand('orgsattachedtouser', this.state.serverInfo, undefined, res=>{
            this.pendingRef.current?.decUse();
            const nState: IAppState = this.state;
            nState.orgs = res;
            this.onOrgsListUpdated();
        }, err=>{
            this.pendingRef.current?.decUse();
            this.displayError(err);
        })
    }

    onError(error: PlutchikError) {
        this.displayError(error);
    }
    onNewOrgCreated(org: any) {
        localStorage.setItem('plutchik_currentOrg', org._id);
        const foundOrg = this.state.orgs.findIndex((v: any) =>v._id === org._id);
        if (foundOrg > -1) {
            const nState: IAppState = this.state;
            nState.orgs[foundOrg] = org;
        } else {
            this.state.orgs.push(org);
        }
        this.onOrgsListUpdated();
    }

    onModeChanged(newMode: AppMode) {
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
            }, 5000);
        }
    }

    displayError(err: PlutchikError) {
        const s = this.messagesRef.current?.state;
        if (s) {
            (s.errors as PlutchikError[]).push(err);
            this.messagesRef.current?.setState(s);
        }
    }

    onOrgsListUpdated() {
        const nState: IAppState = this.state;
        nState.currentOrg = localStorage.getItem('plutchik_currentOrg') === null?undefined:localStorage.getItem('plutchik_currentOrg') as string;
        nState.currentOrgStats = undefined;
        this.loadOrganizationStats();
        this.setState(nState);
    }

    onUserMngOrgUpdated(org: any) {
        const nState: IAppState = this.state;
        const foundEl = this.state.orgs.findIndex(v=>v._id === org._id);
        nState.orgs[foundEl] = org;
        this.setState(nState);
    }

    onContentError(err: PlutchikError) {
        if (err.code === "notfound") {
            localStorage.removeItem('plutchik_currentOrg');
            this.loadOrganizations();
        } else {
            this.displayError(err)
        }
    }

    prepareStats() {
        const stats = this.state.currentOrgStats;
        stats.organizations.forEach((org: any)=>{org.created = new Date(org.created); org.changed = new Date(org.changed)});
        stats.contents.forEach((ci: any)=>{ci.created = new Date(ci.created); ci.changed = new Date(ci.changed)});
        stats.assessments.forEach((a: any)=>{a.created = new Date(a.created)});
    }

    loadOrganizationStats() {
        if (this.state.currentOrg === undefined) return;
        this.pendingRef.current?.incUse();
        serverCommand("getorganizationstats", this.state.serverInfo, JSON.stringify({
            oid: this.state.currentOrg}), res=>{
                this.pendingRef.current?.decUse();
                const nState: IAppState = this.state;
                nState.currentOrgStats = res;
                this.prepareStats();
                this.setState(nState);
            }, err=>{
                this.pendingRef.current?.decUse();
                this.displayError(err);
            })
    }
    
    render(): React.ReactNode {
        const current_org = this.state.orgs.filter(v=>v._id === this.state.currentOrg)[0];
        return <div className='app-container'>
            <TGLogin ref={this.loginRef} pending={this.pendingRef} onStateChanged={(oldState: LoginFormStates, newState: LoginFormStates, info:IServerInfo)=>this.onLoginStateChanged(oldState, newState, info)} onUserInfoLoaded={ui=>this.onUILoaded(ui)} onError={(err)=>this.displayError(err)}/>
            
            {this.state.logged?<User userInfo={this.state.userInfo} serverInfo={this.state.serverInfo} onLogoutClick={()=>this.loginRef.current?.logout()}></User>:<div/>}
            
            {this.state.logged?<Organizations mode={this.state.mode?this.state.mode:"content"} onSuccess={res=>this.displayInfo(res)} serverInfo={this.state.serverInfo} onOrgSelected={this.onOrgSelected.bind(this)} onError={err=>this.displayError(err)} onModeChanged={this.onModeChanged.bind(this)} currentOrg={this.state.currentOrg} onCreateNewOrg={this.onNewOrgCreated.bind(this)} orgs={this.state.orgs}></Organizations>:<div/>}
            
            {this.state.logged?
            /** users mode */
            this.state.mode === "users"?
            this.state.currentOrg === undefined?<></>:
            <UserMng onOrgUpated={this.onUserMngOrgUpdated.bind(this)} serverInfo={this.state.serverInfo} org={current_org} onSuccess={res=>this.displayInfo(res)} onError={err=>this.displayError(err)} userid={this.state.userInfo._id} pending={this.pendingRef}/>

            /** stats mode */
            :this.state.mode === "stats"?this.state.currentOrg === undefined?<></>:
            <Stats stats={this.state.currentOrgStats}/>

            /** content mode */
            :this.state.currentOrg === undefined?<></>:
            <Content key={this.state.currentOrg} ref={this.contentRef} serverInfo={this.state.serverInfo} orgid={this.state.currentOrg} userid={this.state.userInfo._id} onSuccess={res=>this.displayInfo(res)} onError={this.onContentError.bind(this)} pending={this.pendingRef}></Content>:<div/>}
            
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