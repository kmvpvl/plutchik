import { ReactNode, RefObject } from 'react';
import './userMng.css';
import React from 'react';
import { IServerInfo, PlutchikError, relativeDateString, serverCommand } from '../../model/common';
export interface  IUserMngProps {
    serverInfo: IServerInfo;
    org: any;
    userid: string;
    onSuccess?: (text: string)=>void;
    onError?: (err: PlutchikError)=>void;
}

export interface IUserMngState {
    mode: string;
    selectedInvitation?: any;
    answersOnSelectedInvitation?: any;
}

export default class UserMng extends React.Component<IUserMngProps, IUserMngState> {
    newUserRef: RefObject<HTMLInputElement> = React.createRef();
    state: IUserMngState = {
        mode: "content"
    }
    
    inviteUser () {
        const nState: IUserMngState = this.state;
        nState.mode = "inviting";
        this.setState(nState);
    }
    
    cancelInvitation () {
        const nState: IUserMngState = this.state;
        nState.mode = "content";
        this.setState(nState);
    }
    
    sendRequestToUser () {
        const nState: IUserMngState = this.state;
        nState.mode = "content";
        this.setState(nState);
        serverCommand('requesttoassignorgtouser', this.props.serverInfo, JSON.stringify({
            oid: this.props.org._id,
            tguserid: this.newUserRef.current?.value
        }), res=>{
            if (this.props.onSuccess) this.props.onSuccess(JSON.stringify(res));
            this.setState((prev, props)=>{})
        }, err=>{
            if (this.props.onError) this.props.onError(err);
        })
    }

    onInvitationSelect(invitation: any, answers: any[]){
        const nState: IUserMngState = this.state;
        if (nState.selectedInvitation !== invitation) 
        nState.selectedInvitation = invitation;
        nState.answersOnSelectedInvitation = answers;
        this.setState(nState);
    }

    renderSelectedInvitation(): ReactNode {
        if (this.state.selectedInvitation !== undefined) {
            const inv = this.state.selectedInvitation;
            const answers = this.state.answersOnSelectedInvitation;
            const inv_date = new Date(inv.messageToUser.date * 1000);
            return <>
                <div>Invitation was sent: {inv_date.toLocaleString()}<button>Retry</button><button>Clear</button></div>
                {answers.length === 0?<div>No answers</div>:
                <div className='user-mng-user-info-table'>
                    <span className='user-mng-user-info-table-header'>Answer date</span>
                    <span className='user-mng-user-info-table-header'>Result</span>
                    {answers.map((v: any, i: any)=><React.Fragment key={i}>
                        <span className='user-mng-user-info-table-cell'>{new Date(v.created).toLocaleString()}</span>
                        <span className='user-mng-user-info-table-cell'>{v.acceptordecline?"accepted":"declined"}</span></React.Fragment>)}
                </div>}
            </>;
        } else return <></>;
    }

    render(): ReactNode {
        return <div className='user-mng-container'>
            <span className="user-mng-label">Users and customers</span>
            <span className="user-mng-toolbar">
                {this.state.mode === "content"?
                /** INVITING mode */<>
                <button onClick={this.inviteUser.bind(this)}>Invite user</button>
                <span>|</span>
                <button>Invitation stats</button></>:
                this.state.mode === "inviting"?
                /** INVITING mode */<>
                <input ref={this.newUserRef} placeholder='Type Telegram username or user id'></input>
                <button onClick={this.sendRequestToUser.bind(this)}>Send request</button>
                <button onClick={this.cancelInvitation.bind(this)}>Cancel</button>
                </>:
                /** unknown mode */
                <div></div>}
            </span>
            <span className="user-mng-area">
                <span className='user-mng-users'>
                {this.props.org.invitations === undefined?<span>No one invitation</span>
                :this.props.org.invitations.map((v: any, i: any)=>{
                    const responses:[] =this.props.org.responses_to_invitations?this.props.org.responses_to_invitations.filter((f: any)=>v._id === f.response_to):[];
                    responses.sort((a: any, b: any)=>new Date(b.created).getTime() - new Date(a.created).getTime());
                    return <InvitedUser key={i} invitation={v} responses={responses} onClick={this.onInvitationSelect.bind(this, v, responses)} selected={this.state.selectedInvitation?._id === v._id}></InvitedUser>
                })}
                </span>
                <span className='user-mng-user-info'>
                    {this.renderSelectedInvitation()}
                </span>
            </span>
        </div>
    }
}

export interface IInvitedUserProps {
    invitation: any;
    responses: any[];
    onClick: (inv_id: string)=>void
    selected: boolean;
}

export interface IInvitedUsersState {
}

export class InvitedUser extends React.Component<IInvitedUserProps, IInvitedUsersState> {
    state: IInvitedUsersState = {
    }
    render(): ReactNode {
        const inv = this.props.invitation;
        const isAccepted = this.props.responses.length === 0?"pending":this.props.responses[0].acceptordecline?"accepted":"declined";
        return <div className={`user-mng-invited-user-container ${this.props.selected?"selected":""} ${isAccepted}`} onClick={e=>{
                this.props.onClick(this.props.invitation._id);
            }}>
            <span>To {`${inv.messageToUser.chat.first_name} ${inv.messageToUser.chat.last_name}`}({inv.whom_tguserid})</span>
            <span>sent {relativeDateString(new Date(inv.messageToUser.date * 1000))}</span>
            <span>Status: {isAccepted}: {this.props.responses.length?`${this.props.responses.length} answer(s)`:""}</span>
        </div>
    }
}