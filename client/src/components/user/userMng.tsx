import { ReactNode, RefObject } from 'react';
import './userMng.css';
import React from 'react';
import { IServerInfo, PlutchikError, relativeDateString, serverCommand } from '../../model/common';
import Insights from '../insights/insights';
import Chart from 'react-google-charts';
import Pending from '../pending/pending';
import { EmotionType } from '../emotion/emotion';
import MLString from '../../model/mlstring';
export interface  IUserMngProps {
    serverInfo: IServerInfo;
    org: any;
    userid: string;
    pending?: RefObject<Pending>;
    onSuccess?: (text: string)=>void;
    onError?: (err: PlutchikError)=>void;
    onOrgUpated: (org: any)=>void;
}

export interface IUserMngState {
    mode: string;
    selectedInvitation?: any;
    answersOnSelectedInvitation?: any;
    invitationStats?: any;
    setStats?: any;
}

export default class UserMng extends React.Component<IUserMngProps, IUserMngState> {
    newUserRef: RefObject<HTMLInputElement> = React.createRef();
    state: IUserMngState = {
        mode: "content"
    }

    componentDidUpdate(): void {
        if (this.props.org?._id !== this.state.setStats?.orgid) {
            this.loadSetStats();
        }
        if (this.state.selectedInvitation !== undefined) {
            const selectedInv = this.props.org.invitations?.filter((v: any)=>v._id === this.state.selectedInvitation?._id);
            if (selectedInv === undefined || selectedInv.length === 0) {
                const nState: IUserMngState = this.state;
                nState.selectedInvitation = undefined;
                this.setState(nState);
            }
        }

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
        this.props.pending?.current?.incUse();
        serverCommand('requesttoassignorgtouser', this.props.serverInfo, JSON.stringify({
            oid: this.props.org._id,
            tguserid: this.newUserRef.current?.value
        }), res=>{
            this.props.pending?.current?.decUse();
            if (this.props.onSuccess) this.props.onSuccess("Invitation sent successfully");
            this.setState((prev, props)=>{})
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }
    loadInvitationStats(invitation_id: any) {
        this.props.pending?.current?.incUse();
        serverCommand("getinvitationstats", this.props.serverInfo, JSON.stringify({
            oid: this.props.org._id,
            invitation_id: invitation_id
        }), res=>{
            this.props.pending?.current?.decUse();
            const nState: IUserMngState = this.state;
            nState.invitationStats = res;
            this.setState(nState);
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }

    loadSetStats() {
        if (this.props.org === undefined) return;
        this.props.pending?.current?.incUse();
        serverCommand("getorganizationstats", this.props.serverInfo, JSON.stringify({
            oid: this.props.org._id}), res=>{
                this.props.pending?.current?.decUse();
                for (let i = 0; i < res.countByDate.length; i ++) {
                    res.countByDate[i].day = new Date(res.countByDate[i].day);
                }
                const nState: IUserMngState = this.state;
                res.orgid = this.props.org._id;
                nState.setStats = res;
                this.setState(nState);
            }, err=>{
                this.props.pending?.current?.decUse();
                if (this.props.onError) this.props.onError(err);
            })
    }

    onInvitationSelect(invitation: any, answers: any[]){
        this.loadInvitationStats(invitation._id);
        const nState: IUserMngState = this.state;
        if (nState.selectedInvitation !== invitation) 
        nState.selectedInvitation = invitation;
        nState.answersOnSelectedInvitation = answers;
        this.setState(nState);
    }

    onSetStatsButtonClick() {
        const nState: IUserMngState = this.state;
        nState.selectedInvitation = undefined;
        nState.answersOnSelectedInvitation = undefined;
        this.setState(nState);
        this.loadSetStats();
    }

    renderSelectedInvitation(): ReactNode {
        if (this.state.selectedInvitation !== undefined) {
            const inv = this.state.selectedInvitation;
            const answers = this.state.answersOnSelectedInvitation;
            const inv_date = new Date(inv.messageToUser.date * 1000);
            const observe = this.state.invitationStats?.observe;
            const diffs = this.state.selectedInvitation?.diffs;
            return <>
                <div>Invitation was sent: {inv_date.toLocaleString()}{/*<button>Retry</button><button>Clear</button>*/}</div>
                {answers.length === 0?<div>No answers</div>:
                <div className='user-mng-user-info-table'>
                    <span className='user-mng-user-info-table-header'>Answer date</span>
                    <span className='user-mng-user-info-table-header'>Result</span>
                    {answers.map((v: any, i: any)=><React.Fragment key={i}>
                        <span className='user-mng-user-info-table-cell'>{new Date(v.created).toLocaleString()}</span>
                        <span className='user-mng-user-info-table-cell'>{v.acceptordecline?"accepted":"declined"}</span></React.Fragment>)}
                </div>}
                <div>Stats: {this.state.invitationStats?<>{this.state.invitationStats.assigned?`Assigned ${new Date(this.state.invitationStats.assigndate).toLocaleString()}, Progress: ${this.state.invitationStats.contentassessed} of ${this.state.invitationStats.contentcount}, ${this.state.invitationStats.closed?`Closed ${new Date(this.state.invitationStats.closedate).toLocaleString()}`:"Not closed"}`:"Not assigned"}</>:
                <></>}</div>
                {observe !== undefined && observe.ownVector !== undefined?
                <><Insights mycount={observe.ownVector.count} myvector={observe.ownVector} otherscount={observe.othersVector.count} othersvector={observe.othersVector} onClick={(emotion: EmotionType)=>{
                    serverCommand("reviewemotionaboveothers", this.props.serverInfo, JSON.stringify({
                        emotion: emotion, 
                        invitationid: this.state.selectedInvitation._id}), res=>{
                        const nState: IUserMngState = this.state;

                        nState.selectedInvitation.diffs = {
                            emotion: emotion,
                            decoding: res.decoding
                        }
                        this.setState(nState);
                    }, err=>{
                        if (this.props.onError) this.props.onError(err);
                    });
                }}></Insights>
                {diffs !== undefined?<div className='user-mng-user-assessments'>
                    <div className='user-mng-user-assessments-emotion'>Emotion: <span style={{backgroundColor: `var(--${diffs.emotion}-color)`}}>{diffs.emotion}</span></div>
                    <div>Below items to see how user's scores differ from other people's scores</div>
                    <div className='user-mng-user-assessments-thumbs'>{diffs.decoding.map((v: any, i: any)=>{
                        const mlName = new MLString(v.contentitem.name);
                        return <span key={i} className='user-mng-user-assessments-thumb'>
                            <span className='user-mng-user-assessments-thumb-label'>{mlName.toString()}</span>
                            <span className='user-mng-user-assessments-thumb-user'>User discovered: {Math.round(v.vector[diffs.emotion]*100)}%</span>
                            <span className='user-mng-user-assessments-thumb-others'>Others assessed: {Math.round(v.others.emotion*100)}%</span>
                            <span className='user-mng-user-assessments-thumb-img-fit'><img src={v.contentitem.url} alt={mlName.toString()}/></span>
                        </span>})}</div>
                </div>:<></>}</>
                :<></>}
            </>;
        } else return <></>;
    }

    renderSetStats(): ReactNode {
        if (this.state.setStats?.countByDate === undefined) return <></>;
        const data = [
            [
              {
                type: "date",
                id: "day",
              },
              {
                type: "number",
                id: "Count",
              },
            ],
          ];
        for (let i = 0; i < this.state.setStats?.countByDate.length; i++) {
            data.push([this.state.setStats?.countByDate[i].day, this.state.setStats?.countByDate[i].count]);
        }

        return <div className='user-mng-set-stats-container'>
            <Chart key={this.props.org?._id} chartType="Calendar" width="100%" height="400px" data={data} options={{title: "Stats: assessments count by date"}}/>
        </div>
    }

    render(): ReactNode {
        return <div className='user-mng-container'>
            <span className="user-mng-label">Users and customers</span>
            <span className="user-mng-toolbar">
                {this.state.mode === "content"?
                /** INVITING mode */<>
                <button onClick={this.inviteUser.bind(this)}>Invite user</button>
                <span>|</span>
                <button onClick={this.onSetStatsButtonClick.bind(this)}>Invitation stats</button></>:
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
                {this.props.org?.invitations === undefined?<span>No one invitation</span>
                :this.props.org.invitations.sort((a: any, b: any)=>b.messageToUser.date - a.messageToUser.date).map((v: any, i: any)=>{
                    const responses:[] =this.props.org.responses_to_invitations?this.props.org.responses_to_invitations.filter((f: any)=>v._id === f.response_to):[];
                    responses.sort((a: any, b: any)=>new Date(b.created).getTime() - new Date(a.created).getTime());
                    return <InvitedUser key={i} invitation={v} responses={responses} onClick={this.onInvitationSelect.bind(this, v, responses)} selected={this.state.selectedInvitation?._id === v._id}></InvitedUser>
                })}
                </span>
                <span className='user-mng-user-info'>
                    {this.state.selectedInvitation !== undefined?this.renderSelectedInvitation(): this.renderSetStats()}
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