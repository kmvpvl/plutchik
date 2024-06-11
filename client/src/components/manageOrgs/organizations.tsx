import React, { RefObject } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import Pending from "../pending/pending";
import "./organizations.css";

interface IOrgsProps {
    serverInfo: IServerInfo,
    onError?: (err: PlutchikError)=>void,
    onCreateNewOrg?: ( org: any)=>void,
    onOrganizationListLoaded?: (orgs: Array<any>)=>void,
    onOrgSelected:(orgid: string)=>void,
    pending?: RefObject<Pending>
}

interface IOrgsState {
    orgs:any[]
    currentOrg?: string | null;
    mode: string;
}

export default class Organizations extends React.Component<IOrgsProps, IOrgsState> {
    state = {
        orgs: [],
        currentOrg: localStorage.getItem('plutchik_currentOrg'),
        mode: "content"
    }
    componentDidMount(): void {
        this.loadOrganizations();
    }
    
    createNewOrganization(){
        this.props.pending?.current?.incUse();
        serverCommand('createorganization', this.props.serverInfo, JSON.stringify({
            name: 'Test',
            emails: 'rrr'
        }), (res)=>{
            if (this.props.onCreateNewOrg) this.props.onCreateNewOrg(res);
            this.props.pending?.current?.decUse();
        }, (err)=>{
            if (this.props.onError) this.props.onError(err);
            this.props.pending?.current?.decUse();
        });
    }
    loadOrganizations() {
        this.props.pending?.current?.incUse();
        serverCommand('orgsattachedtouser', this.props.serverInfo, undefined, res=>{
            if(this.props.onOrganizationListLoaded) this.props.onOrganizationListLoaded(res);
            const nState: IOrgsState = this.state;
            nState.orgs = res;
            this.setState(nState);
            if (this.state.orgs.length) this.props.onOrgSelected(this.state.currentOrg?this.state.currentOrg:(this.state.orgs[0] as any)._id);
            this.props.pending?.current?.decUse();
        }, err=>{
            if (this.props.onError) this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }
    orgSelected(orgid: string) {
        const nState: IOrgsState = this.state;
        nState.currentOrg = orgid;
        localStorage.setItem('plutchik_currentOrg', orgid);
        this.setState(nState);
        this.props.onOrgSelected(orgid);
    }
    
    render(): React.ReactNode {
        const orgs = this.state.orgs;
        const cur_org = this.state.currentOrg?this.state.currentOrg:undefined;
        return <div className="orgs-container">
            <span className="orgs-cur-org">
                {orgs.length === 0?<span className="orgs-label">No one set you have</span>:
                <span><span className="orgs-label">Choose a set of content </span>
                <select onChange={e=>this.orgSelected(e.currentTarget.value)} 
                    defaultValue={cur_org}>
                    {orgs.map((v: any, i)=><option key={i} value={v._id}>{v.name}</option>)}
                </select> &nbsp;</span>
                }
            </span>
            <span className="orgs-toolbar">
            {orgs.length !== 0?<><button>Edit</button>
                <button>Rename</button>
                <button>Manage users</button>
                <button>Manage assistants</button>
                <span>|</span>
                <button>Remove set</button>
                </>:<></>}
                <button>Create new set</button>
            </span>
            <span>{/*JSON.stringify(orgs)*/}</span>
        </div>;
    }
}