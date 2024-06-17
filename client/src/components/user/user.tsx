import React from 'react';
import { IServerInfo } from '../../model/common';
import './user.css'

interface IUserProps {
    serverInfo: IServerInfo;
    userInfo: any;
    onLogoutClick: ()=>void;
}

interface IUserState {
}

export default class User extends React.Component<IUserProps, IUserState> {
    state: IUserState = {
    }
    componentDidMount(): void {
    }
    render(): React.ReactNode {
        const userinfo = this.props.userInfo;
        //const age = Math.round((new Date().getTime() - new Date(userinfo.birthdate).getTime())/1000/60/60/24/365.25);
        return <span className='user-container'>
            <span className="user-logo-center">
                <span className="user-logo-letters-container">
                    <span>PLUT</span>
                    <img src="plutchart_logo.svg" alt="" height="30px"></img>
                    <span>CHART</span>
                </span>
            </span>
            <span className='user-info'>{`Hello ${userinfo.name}!`}</span>
            <span className='user-toolbar'>
                <a href={process.env.REACT_APP_LANDING_PAGE} target='blank'>I need help</a>&nbsp;
                <button onClick={()=>this.props.onLogoutClick()}>Logout</button>
            </span>
        </span>
    }
}