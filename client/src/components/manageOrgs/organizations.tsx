import React, { RefObject, createRef } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import Pending from "../pending/pending";
import "./organizations.css";
import { AppMode } from "../../App";

interface IOrgsProps {
    serverInfo: IServerInfo,
    onError?: (err: PlutchikError)=>void,
    onSuccess?: (text: string)=>void,
    onCreateNewOrg?: ( org: any)=>void,
    onOrgSelected:(orgid: string)=>void,
    onModeChanged: (newmode: AppMode)=>void,
    orgs: any[];
    currentOrg?: string;
    mode: AppMode;
    pending?: RefObject<Pending>
}

interface IOrgsState {
    mode: string;
}

export default class Organizations extends React.Component<IOrgsProps, IOrgsState> {
    newOrgNameRef: RefObject<HTMLInputElement> = createRef();
    orgsSelectorRef: RefObject<HTMLSelectElement> = createRef();
    state = {
        orgs: [],
        mode: "content"
    }
    createNewOrganization(){
        this.props.pending?.current?.incUse();
        serverCommand('createorganization', this.props.serverInfo, JSON.stringify({
            name: 'New content items set',
            emails: ''
        }), (res)=>{
            this.props.pending?.current?.decUse();
            if (this.props.onCreateNewOrg) this.props.onCreateNewOrg(res);
        }, (err)=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        });
    }
    orgSelected(orgid: string) {
        localStorage.setItem('plutchik_currentOrg', orgid);
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
            oid: this.props.currentOrg,
            newname: newName
        }), res=>{
            this.props.pending?.current?.decUse();
            if (this.props.onCreateNewOrg) this.props.onCreateNewOrg(res);
            if (this.props.onSuccess) this.props.onSuccess(`Set re-named successfully, new name '${newName}'`);
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
        const nState: IOrgsState = this.state;
        nState.mode = "content";
        this.setState(nState);
    }

    cancelRenameOrg(){
        const nState: IOrgsState = this.state;
        nState.mode = "content";
        this.setState(nState);
    }

    componentDidUpdate(prevProps: Readonly<IOrgsProps>, prevState: Readonly<IOrgsState>, snapshot?: any): void {
        const orgs = this.props.orgs;
        const cur_org = this.props.currentOrg;
        if (orgs !== undefined && orgs.length > 1 && cur_org === undefined) {
            this.orgSelected(orgs[0]._id);
        }
    }
    
    render(): React.ReactNode {
        const orgs = this.props.orgs;
        const cur_org = this.props.currentOrg;
        let cur_org_name = "";
        if (cur_org !== undefined) {
            const f = orgs.filter((v: any)=>v._id === cur_org);
            if (f.length === 1) cur_org_name = (f[0]as any).name;
        }
        return <div className="orgs-container">
            <span className="orgs-cur-org">
                {orgs.length === 0?<span className="orgs-label">No one set you have</span>:
                <span><span className="orgs-label">Choose a set of content </span>
                {this.state.mode !== "edit set name"?<select ref={this.orgsSelectorRef} onChange={e=>this.orgSelected(e.currentTarget.value)} /*defaultValue={cur_org}*/ value={cur_org}>
                    {orgs.map((v: any, i)=><option key={i} value={v._id} /*selected={cur_org === v._id}*/>{v.name}</option>)}
                </select>:<input autoFocus ref={this.newOrgNameRef} defaultValue={cur_org_name} onKeyDown={event=>{
                    switch (event.key){
                        case "Escape": this.cancelRenameOrg(); break;
                        case "Enter": this.renameCurOrg(); break;
                    }
                }}></input>} &nbsp;</span>
                }
            </span>
            <span className="orgs-toolbar">
            {orgs.length !== 0?<>
            {this.state.mode === "content" || this.state.mode === "users"?
                <>{/* here's button for content mode */}
                <button onClick={this.onRenameSetButtonClick.bind(this)}>Rename set</button>
                <span>|</span>
                <button onClick={this.createNewOrganization.bind(this)}>Create new set</button>
                {/*<button>Remove set</button>*/}
                <span>|</span>
                <button className={this.props.mode === "content"?"selected":""} onClick={e=>this.props.onModeChanged("content")}>Edit content</button>
                <button className={this.props.mode === "users"?"selected":""} onClick={e=>this.props.onModeChanged("users")}>Manage users</button></>:<>
                {this.state.mode === "edit set name"?
                <>{/*here buttons in rename org mode*/}
                <button onClick={this.renameCurOrg.bind(this, this.newOrgNameRef.current?.value)}>Save new set name</button>
                <button onClick={this.cancelRenameOrg.bind(this)}>Cancel rename</button>
                </>
                :<> {/** here's buttons if not content and not edit name */}
                </>}
                </>
            }
            {/*<button>Manage assistants</button>*/}        
            </>:<></>}
            </span>
            <span>{/*JSON.stringify(orgs)*/}</span>
        </div>;
    }
}