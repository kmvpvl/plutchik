import React, { RefObject } from 'react';
import './chat.css';
import { IServerInfo, PlutchikError, serverCommand } from '../../model/common';
import Pending from '../pending/pending';
import UserThumb from '../user/userthumb';

export interface IChatProps {
    serverInfo: IServerInfo;
    oid: string;
    pending?: RefObject<Pending>;
    onSuccess: (text: string)=>void;
    onError: (err: PlutchikError)=>void;
}

export interface IChatState {
    users: any[]
}

export default class Chat extends React.Component<IChatProps, IChatState> {
    state = {
        users: []
    }
    componentDidMount(): void {
        this.loadUsersAssessed();
    }
    
    componentDidUpdate(prevProps: Readonly<IChatProps>, prevState: Readonly<IChatState>, snapshot?: any): void {
        if (prevProps.oid !== this.props.oid) this.loadUsersAssessed();
    }
    loadUsersAssessed () {
        this.props.pending?.current?.incUse();
        serverCommand(`getusersassessedorganizationcontent`, this.props.serverInfo, JSON.stringify({oid: this.props.oid}), res=>{
            const nState: IChatState = this.state;
            nState.users = res;
            this.setState(nState);
            this.props.pending?.current?.decUse();
        }, err=>{
            this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }
    render(): React.ReactNode {

        return <>
        <div><span>Chat</span>
        <div className='users-container'>
            {this.state.users.map((v: any, i)=><UserThumb key={i} oid={this.props.oid} userInfo={v} serverInfo={this.props.serverInfo} pending={this.props.pending} onError={err=>this.props.onError(err)} onSuccess={text=> this.props.onSuccess(text)}/>)}
        </div>
        </div>
        </>;
    }
}
