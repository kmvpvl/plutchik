import React, { RefObject, createRef } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import Pending from "../pending/pending";
import "./organizations.css";

type OrgsModes = "content" | "edit set name";

interface IOrgsProps {
    serverInfo: IServerInfo,
    onError?: (err: PlutchikError)=>void,
    onSuccess?: (text: string)=>void,
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
    newOrgNameRef: RefObject<HTMLInputElement> = createRef();
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
            this.props.pending?.current?.decUse();
            if(this.props.onOrganizationListLoaded) this.props.onOrganizationListLoaded(res);
            const nState: IOrgsState = this.state;
            nState.orgs = res;
            this.setState(nState);
            if (this.state.orgs.length) this.props.onOrgSelected(this.state.currentOrg?this.state.currentOrg:(this.state.orgs[0] as any)._id);
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }
    orgSelected(orgid: string) {
        const nState: IOrgsState = this.state;
        nState.currentOrg = orgid;
        localStorage.setItem('plutchik_currentOrg', orgid);
        this.setState(nState);
        this.props.onOrgSelected(orgid);
    }

    onRenameSetButtonClick() {
        const nState: IOrgsState = this.state;
        nState.mode = "edit set name";
        this.setState(nState);
    }

    renameCurOrg(newName?: string) {
        if (newName === undefined) newName = this.newOrgNameRef.current?.value;
        this.props.pending?.current?.incUse();
        serverCommand('renameorganization', this.props.serverInfo, JSON.stringify({
            oid: this.state.currentOrg,
            newname: newName
        }), res=>{
            this.props.pending?.current?.decUse();
            if (this.props.onSuccess) this.props.onSuccess(`Set re-named successfully, new name '${newName}'`);
            this.loadOrganizations();
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
        const nState: IOrgsState = this.state;
        nState.mode = "content";
        this.setState(nState);
    }
    
    render(): React.ReactNode {
        const orgs = this.state.orgs;
        const cur_org = this.state.currentOrg?this.state.currentOrg:undefined;
        let cur_org_name = "";
        if (cur_org !== undefined) {
            const f = orgs.filter((v: any)=>v._id === cur_org);
            if (f.length === 1) cur_org_name = (f[0]as any).name;
        }
        return <div className="orgs-container">
            <span className="orgs-cur-org">
                {orgs.length === 0?<span className="orgs-label">No one set you have</span>:
                <span><span className="orgs-label">Choose a set of content </span>
                {this.state.mode !== "edit set name"?<select onChange={e=>this.orgSelected(e.currentTarget.value)} 
                    defaultValue={cur_org}>
                    {orgs.map((v: any, i)=><option key={i} value={v._id}>{v.name}</option>)}
                </select>:<input ref={this.newOrgNameRef} defaultValue={cur_org_name}></input>} &nbsp;</span>
                }
            </span>
            <span className="orgs-toolbar">
            {orgs.length !== 0?<>
            {this.state.mode === "content"?
                <><button>Edit content</button>
                <button onClick={this.onRenameSetButtonClick.bind(this)}>Rename set</button>
                <button>Manage users</button></>:<>
                {this.state.mode === "edit set name"?<>
                <button onClick={this.renameCurOrg.bind(this, this.newOrgNameRef.current?.value)}>Save new set name</button>
            </>:<>
            </>}
            </>
            }
{/*                 <button>Manage assistants</button>
 */}        
            <span>|</span>
                <button>Remove set</button>
                <button>Create new set</button>
            </>:<></>}
            </span>
            <span>{/*JSON.stringify(orgs)*/}</span>
        </div>;
    }
}