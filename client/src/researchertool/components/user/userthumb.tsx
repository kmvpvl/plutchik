import React from 'react';
import { IServerInfo, PlutchikError, serverCommand } from './../../model/common';
import './user.css'
import Pending from './../pending/pending';

export type UserModes = "user" | "psychologist" | "user:insights" | "psychologist:chat" | "psychologist:content";

interface IUserThumbProps {
    serverInfo: IServerInfo;
    oid: string;
    userInfo: any;
    pending?: React.RefObject<Pending>;
    onError: (err: PlutchikError)=>void;
    onSuccess: (text: string)=>void;
}

interface IUserThumbState {
}

export default class UserThumb extends React.Component<IUserThumbProps, IUserThumbState> {
    messageRef: React.RefObject<HTMLInputElement> = React.createRef();
    state: IUserThumbState = {
    }
    componentDidMount(): void {
    }
    render(): React.ReactNode {
        const age = Math.round((new Date().getTime() - new Date(this.props.userInfo.birthdate).getTime())/1000/60/60/24/365.25);
        return <span className='user-thumb'>
            <span className='user-properties-thumb'>
                <span>🪪 Telegram id: {this.props.userInfo.tguserid}</span> <span>🌐 language: {this.props.userInfo.nativelanguage}</span> <span>🧑‍🤝‍🧑 gender: {this.props.userInfo.gender}</span> <span>🎂 {age} y.o.</span><span>Assessments: {this.props.userInfo.assessedcount}</span>
            </span>
            <span>
                <input placeholder='Message' ref={this.messageRef}></input> <button onClick={e=>{
                    this.props.pending?.current?.incUse();
                    serverCommand(`informuserbytg`, this.props.serverInfo, JSON.stringify({tguserid:this.props.userInfo.tguserid, message: this.messageRef.current?.value, organizationid: this.props.oid}), res=>{
                        // const nState: IChatState = this.state;
                        // nState.users = res;
                        // this.setState(nState);
                        //alert(new Date(res).toLocaleString());
                        this.props.onSuccess(`The best time to send message ${new Date(res).toLocaleString()}`);
                        this.props.pending?.current?.decUse();
                    }, err=>{
                        this.props.onError(err);
                        this.props.pending?.current?.decUse();
                    })
                }}>Send</button>
            </span>
        </span>
    }
}