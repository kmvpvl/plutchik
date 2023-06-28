import React, { RefObject } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import Pending from "../pending/pending";

interface IOrgsProps {
    serverInfo: IServerInfo,
    onError?: (err: PlutchikError)=>void,
    onCreateNewOrg?: ( org: any)=>void,
    onOrganizationListLoaded?: (orgs: Array<any>)=>void
    onOrgSelected:(orgid: string)=>void
    pending?: RefObject<Pending>
}

interface IOrgsState {
    orgs:any[]
    currentOrg?: string | null;
}

export default class Organizations extends React.Component<IOrgsProps, IOrgsState> {
    state = {
        orgs: [],
        currentOrg: localStorage.getItem('currentOrg')
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
    orgSelected(e: any) {
        const nState: IOrgsState = this.state;
        nState.currentOrg = e.currentTarget.value;
        localStorage.setItem('currentOrg', e.currentTarget.value);
        this.setState(nState);
        this.props.onOrgSelected(e.currentTarget.value);
    }
    
    render(): React.ReactNode {
        return (
            <div>{this.state.orgs.length?<><span>Organization</span> 
                <select onChange={e=>this.orgSelected(e)} defaultValue={this.state.currentOrg?this.state.currentOrg:''} onCompositionEnd={()=>console.log('test')}>
                    {this.state.orgs.map((v, i)=>(<option key={i} value={(v as any)._id}>{(v as any).name}</option>))}
                </select></>:<></>}
                <button onClick={()=>this.createNewOrganization()}>📄</button>
                <button>🖊️</button>            
            </div>
        );
    }
}