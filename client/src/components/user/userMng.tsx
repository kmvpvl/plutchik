import { ReactNode } from 'react';
import './userMng.css';
import React from 'react';
import { IServerInfo } from '../../model/common';
export interface  IUserMngProps {
    serverInfo: IServerInfo;
    
}

export interface IUserMngState {

}

export default class UserMng extends React.Component<IUserMngProps, IUserMngState> {
    render(): ReactNode {
        return <div className='user-mng-container'>
            <span className="user-mng-label">Users and customers</span>
            <span className="user-mng-toolbar">
                <button>New user</button>
                <span>|</span>
                {/*<button onClick={this.onRevertItem.bind(this)}>Revert item</button>*/}
                <span>|</span>
                <button>Deep check set</button>
                <button>Analyze set</button>
                <span>|</span>
                <button>Analyze set</button>
            </span>
            <span className="user-mng-area">
            </span>
        </div>
    }
}