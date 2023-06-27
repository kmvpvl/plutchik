import React from 'react';
import { IServerInfo } from '../../common';
import './user.css'

export type UserModes = "user" | "psychologist" | "user:insights";

interface IUserProps {
    serverInfo: IServerInfo;
    userInfo: any;
    onChangeMode: (oldMode: UserModes, newMode: UserModes)=>void;
}

interface IUserState {
    mode: UserModes;
}

export default class User extends React.Component<IUserProps, IUserState> {
    state: IUserState = {
        mode: localStorage.getItem('mode')?localStorage.getItem('mode') as UserModes:"user"
    }
    componentDidMount(): void {
        localStorage.setItem('mode', this.state.mode);
        this.props.onChangeMode("user", this.state.mode);
    }
    onModeChanged(e: any){
        const nState: IUserState = this.state;
        const old = nState.mode;
        nState.mode = e.target.value;
        this.setState(nState);
        localStorage.setItem('mode', nState.mode);
        this.props.onChangeMode(old, nState.mode);
    }
    render(): React.ReactNode {
        const age = Math.round((new Date().getTime() - new Date(this.props.userInfo.birthdate).getTime())/1000/60/60/24/365.25);
        return <span className='user-header'>
            <span className='user-properties'>
                <span>🪪 Telegram id: {this.props.serverInfo.tguserid}</span> <span>🌐 language: {this.props.userInfo.nativelanguage}</span> <span>🧑‍🤝‍🧑 gender: {this.props.userInfo.gender}</span> <span>🎂 {age} y.o.</span>
            </span>
            <span onChange={(e)=>this.onModeChanged(e)}>
            <input name="mode" type="radio" value={'user'} defaultChecked={'user'===this.state.mode}/>user
            <input name="mode" type="radio" value={'psychologist'} defaultChecked={'psychologist'===this.state.mode}/>psychologist
            </span>
        </span>
    }
}