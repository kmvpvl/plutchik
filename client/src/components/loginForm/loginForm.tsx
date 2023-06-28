import React, { RefObject } from 'react';
import './loginForm.css';
import { IServerInfo, PlutchikError, serverCommand, serverFetch } from '../../model/common';
import Pending from '../pending/pending';
import MLString from '../../model/mlstring';

const strTryAgain = new MLString({
    default: "Try again", 
    values: new Map([
        ["en-US", "Try again"],
        /*["de", "vermutet"],
        ["fr", "censé"],
        ["es", "supuesto"],
        ["uk", "очікуваний"],*/
        ["ru", "Повторить"]])
});

const strSignOut = new MLString({
    default: "Sign out", 
    values: new Map([
        ["en-US", "Sign out"],
        /*["de", "vermutet"],
        ["fr", "censé"],
        ["es", "supuesto"],
        ["uk", "очікуваний"],*/
        ["ru", "Выйти"]])
});

export type LoginFormStates = 'connecting' | 'connected' | 'revealing_auth_code' | 'logging' | 'logged';

interface ILoginFormProps {
    onStateChanged?: (oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo)=>void;
    onUserInfoLoaded?: (ui: any)=>void;
    onError: (err: PlutchikError)=>void;
    pending?: RefObject<Pending>;
}

interface ILoginFormState {
    state: LoginFormStates;
}

export default class TGLogin extends React.Component<ILoginFormProps, ILoginFormState> {
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
        this.props.pending?.current?.incUse();
        serverFetch('version', 'GET', undefined, undefined,
            res=>{
                this.serverInfo.version = res;
                this.changeState('connected');
                if (this.serverInfo.tguserid && this.serverInfo.sessiontoken) {
                    this.changeState('logged');
                    this.getuserinfo();
                }
                this.props.pending?.current?.decUse();
            },
            err=>{
                this.props.onError(err);
                this.props.pending?.current?.decUse();
            }
        );
    }
    getAuthCode() {
        const tgUI = this.tgUserIdRef.current?.value;
        if (tgUI) {
            localStorage.setItem('tgUserId', tgUI);
            this.props.pending?.current?.incUse();
            serverFetch(`tgcreateauthcode`,'POST', [
                ['plutchik_tguid', tgUI]
            ], undefined,
                res=>{
                    this.changeState('revealing_auth_code')
                    this.props.pending?.current?.decUse();
                }
                ,err=> {
                    this.props.onError(err);
                    this.props.pending?.current?.decUse();
                }
            );
        }
    }
    login() {
        this.changeState('logging');
        if (!this.tgUserIdRef.current || !this.tgAuthCode.current) return;
        //debugger;
        const tgUI = this.tgUserIdRef.current.value;
        const tgAC = this.tgAuthCode.current.value;
        localStorage.setItem('tgUserId', tgUI);
        this.props.pending?.current?.incUse();
        serverFetch(`tggetsessiontoken`, 'GET', { 
            plutchik_tguid: tgUI,
            plutchik_authcode: tgAC
            }, undefined,
            res=>{
                this.serverInfo.tguserid = parseInt(tgUI);
                this.serverInfo.sessiontoken = res;
                localStorage.setItem('sessiontoken', res);
                this.changeState('logged');
                this.getuserinfo();
                this.props.pending?.current?.decUse();
            },
            err=>{
                this.props.onError(err);
                this.props.pending?.current?.decUse();
            }
        );
    }
    logout() {
        localStorage.removeItem('sessiontoken');
        delete this.serverInfo.sessiontoken;
        this.changeState('connecting');
        this.getServerVersion();
    }
    getuserinfo(){
        this.props.pending?.current?.incUse();
        serverCommand('userinfo', this.serverInfo, undefined, res=>{
            if (this.props.onUserInfoLoaded) this.props.onUserInfoLoaded(res)
            this.props.pending?.current?.decUse();
        }, err=>{
                this.logout();
                this.props.onError(err);
                this.props.pending?.current?.decUse();
        })
    }
    render(): React.ReactNode {
        const state = this.state.state;
        return (
            <div className={ 'logged' === state ?'login-form logged':'login-form'}>
                <span className='login-state'>
                    <span>{this.state.state}</span>{'logged' === state ?<span></span>:<button onClick={()=>this.getServerVersion()}>{strTryAgain}</button>}
                </span>
                <span className='login-tguserid'>
                    {'connecting' !== state && 'logged' !== state ? <input type="text" placeholder='Telegram user id' ref={this.tgUserIdRef} defaultValue={this.serverInfo.tguserid}/>:<></>}
                    {'connecting' !== state && 'logged' !== state ? <><button onClick={()=>this.getAuthCode()}>Get code</button><button onClick={()=>{
                        this.setState({state: "revealing_auth_code"});
                    }}>I have code</button></>:<></>}
                </span>
                <span className='login-authcode'>
                    {'revealing_auth_code' === state || 'logging' === state ? <input type="password" placeholder='Code from bot' ref={this.tgAuthCode}/>:<></>}
                    {'revealing_auth_code' === state || 'logging' === state ? <button onClick={()=>this.login()}>Log in</button>:<></>}
                    {'logged' === state ? <button onClick={()=>this.logout()}>{strSignOut}</button>:<></>}
                </span>
                {'connected' === state ? <span className='versions'>{JSON.stringify(this.serverInfo.version)}</span>:<span></span>}
            </div>
        );
    }
}

