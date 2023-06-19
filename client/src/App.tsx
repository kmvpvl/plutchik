import React, { RefObject } from 'react';
import './App.css';
import TGLogin, {LoginFormStates } from './components/loginForm/loginForm';
import './common';
import Organizations from './components/manageOrgs/organizations';
import { IServerInfo, PlutchikError } from './common';
import { ContentItems } from './content/content';

interface IAppState {
    logged: boolean;
    serverInfo: IServerInfo;
    userInfo?: any;
    orgs?: any[];
    orgContent?: any[];
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
        orgContent: []
    }
    messagesRef: RefObject<Infos> = React.createRef();

    public onLoginStateChanged(oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo) {
        const nState: IAppState = this.state;
        nState.logged = newState === 'logged';
        nState.serverInfo = info;
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
        <>
            <TGLogin onStateChanged={(oldState: LoginFormStates, newState: LoginFormStates, info:IServerInfo)=>this.onLoginStateChanged(oldState, newState, info)} onUserInfoLoaded={ui=>this.onUILoaded(ui)} onError={(err)=>this.displayError(err)}/>
            {this.state.logged?<span>User {this.state.serverInfo.tguserid}/{this.state.userInfo.nativelanguage}/{this.state.userInfo.gender}/{this.state.userInfo.birthdate}</span>:<span></span>}
            {this.state.logged?<Organizations serverInfo={this.state.serverInfo} onError={err=>this.onError(err)} onCreateNewOrg={(org)=>this.onNewOrgCreated(org)} onOrganizationListLoaded={(orgs)=>{
                const nState: IAppState = this.state;
                nState.orgs = orgs;
                this.setState(nState);
            }} onOrgSelected={orgid=>{
                const nState: IAppState = this.state;
                nState.currentOrg = orgid;
                this.setState(nState);//=>this.setState(nState));
            }}/>
            :<span></span>}
            {this.state.logged && this.state.currentOrg?<ContentItems serverInfo={this.state.serverInfo} oid={this.state.currentOrg} uid={this.state.userInfo._id} onSuccess={(text: string)=>this.displayInfo(text)} onError={(err: PlutchikError)=>this.displayError(err)}/>:<span></span>}
            <Infos ref={this.messagesRef}/>
        </>
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