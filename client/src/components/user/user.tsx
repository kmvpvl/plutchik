import React from 'react';
import { IServerInfo } from '../../common';

export type UserModes = "user" | "psychologist";

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
        return <span>
            <span>User {this.props.serverInfo.tguserid}/{this.props.userInfo.nativelanguage}/{this.props.userInfo.gender}/{this.props.userInfo.birthdate}
            </span>
            <span onChange={(e)=>this.onModeChanged(e)}>
            <input name="mode" type="radio" value={'user'} defaultChecked={'user'===this.state.mode}/>user
            <input name="mode" type="radio" value={'psychologist'} defaultChecked={'psychologist'===this.state.mode}/>psychologist
            </span>
        </span>
    }
}