import React from 'react';
import { IServerInfo } from '../../model/common';
import './user.css'

interface IUserProps {
    serverInfo: IServerInfo;
    userInfo: any;
}

interface IUserState {
}

export default class User extends React.Component<IUserProps, IUserState> {
    state: IUserState = {
    }
    componentDidMount(): void {
    }
    render(): React.ReactNode {
        const age = Math.round((new Date().getTime() - new Date(this.props.userInfo.birthdate).getTime())/1000/60/60/24/365.25);
        return <span className='user-container'>
            <span className="user-logo-center">
                <span className="user-logo-letters-container">PLUT<img src="plutchart_logo.svg" alt="" height="30px"></img>CHART</span>
            </span>
            <span className='user-info'>{JSON.stringify(this.props.userInfo)}</span>
            <span className='user-toolbar'>Toolbar</span>
        </span>
    }
}