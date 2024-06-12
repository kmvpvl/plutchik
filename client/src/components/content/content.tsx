import React, { RefObject } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import './content.css';
import { Flower } from "../emotion/emotion";
import Pending from "../pending/pending";
import MLString from "../../model/mlstring";
import { MLStringEditor } from "../mlstring/mlstring";

export interface IContentProps {
    serverInfo: IServerInfo;
    userid: string;
    orgid: string;
    pending?: RefObject<Pending>;
    onSuccess?: (text: string)=>void;
    onError?: (err: PlutchikError)=>void;
}

export interface IContentState {
    items: Array<any>;
    curItem?: any;
    curItemStat?: any;
}

export class Content extends React.Component<IContentProps, IContentState> {
    itemFormRef: RefObject<ItemForm> = React.createRef();
    state: IContentState = {
        items: []
    }
    componentDidMount(): void {
        this.loadContentItems();
    }
    componentDidUpdate(prevProps: Readonly<IContentProps>, prevState: Readonly<IContentState>, snapshot?: any): void {
        if (this.props.orgid !== prevProps.orgid) this.loadContentItems();
    }
    loadContentItems(selectItem?: any) {
        this.props.pending?.current?.incUse();
        serverCommand(`getorgcontent`, this.props.serverInfo, JSON.stringify({oid: this.props.orgid}), res=>{
            this.props.pending?.current?.decUse();
            for (const i in res) {
                res[i].name = new MLString(res[i].name);
                res[i].description = new MLString(res[i].description);
            }
            const nState: IContentState = this.state;
            nState.items = res;
            nState.curItem = selectItem;
            this.setState(nState);
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }
    saveItem() {
        const item = this.itemFormRef.current?.state.value;
        this.props.pending?.current?.incUse();
        serverCommand('addcontent', this.props.serverInfo, JSON.stringify({
            contentinfo: item
        }), res=>{
            this.props.pending?.current?.decUse();
            this.itemFormRef.current?.setState( {
                value: res,
                isChanged: false
            });
            if (this.props.onSuccess) this.props.onSuccess(`Saved successfully!`);//\n${JSON.stringify(res)}`);
            this.loadContentItems(item);
        }, err=>{
            this.props.pending?.current?.decUse();
            if (this.props.onError) this.props.onError(err);
        })
    }

    onSelectItem(selectedItem: any) {
        const nState: IContentState = this.state;
        nState.curItem = selectedItem;
        nState.curItemStat = undefined;
        this.setState(nState);
        if (selectedItem === undefined) return;
        this.props.pending?.current?.incUse();
        serverCommand('getcontentstatistics', this.props.serverInfo, JSON.stringify({
            cid: selectedItem._id
        }), (res)=>{
            this.props.pending?.current?.decUse();
            const nState: IContentState = this.state;
            nState.curItemStat = res;
            this.setState(nState);
        }, (err: PlutchikError)=>{
            // for new items server returns http 404 error
            //if (this.props.onError) this.props.onError(err);
            this.props.pending?.current?.decUse();
        });
    }
    onRevertItem() {
        this.itemFormRef.current?.revert();
    }

    onBlockItem() {
        if (this.itemFormRef.current?.blockedRef.current) this.itemFormRef.current.blockedRef.current.checked = true;
    }
    onNewItem() {
        this.onSelectItem(undefined);
    }

    render(): React.ReactNode {
        const items = this.state.items;
        return <div className="content-container">
            <span className="content-label">Content of set editing</span>
            <span className="content-toolbar">
                <button onClick={this.onNewItem.bind(this)}>New item</button>
                {/*<button onClick={this.onBlockItem.bind(this)}>Hide item</button>*/}
                <span>|</span>
                {/*<button onClick={this.onRevertItem.bind(this)}>Revert item</button>*/}
                 <button onClick={this.saveItem.bind(this)}>Save item</button>
                <span>|</span>
                <button>Deep check set</button>
                <button>Analyze set</button>
                <span>|</span>
                {this.state.curItemStat?<span>Assessments: {this.state.curItemStat.count}<Flower width="60px" vector={new Map(Object.entries(this.state.curItemStat).map((v:any, i:any)=>[v[0], v[1]]))}/></span>:<></>}
            </span>
            <span className="content-area">
                <span className="content-items">
                    {items.length === 0?"No items in this set. Create one":items.map((v, i)=><ContentItem key={i} item={v} onSelect={this.onSelectItem.bind(this, v)} selected={this.state.curItem?._id === v._id}/>)}
                </span>
                <ItemForm key={this.state.curItem?this.props.orgid+this.state.curItem._id:""} ref={this.itemFormRef} default_value={this.state.curItem} orgid={this.props.orgid}></ItemForm>
            </span>
        </div>
    }
}

export interface IItemFormProps {
    orgid: string;
    pending?: RefObject<Pending>;
    default_value: any;
}

export interface IItemFormState {
    value: any;
    isChanged: boolean;
}

export class ItemForm extends React.Component<IItemFormProps, IItemFormState> {
    constructor(props: any) {
        super(props);
        //r = Math.round(Math.random()*1000);
        const tvalue = this.props.default_value?JSON.parse(JSON.stringify(this.props.default_value)):this.newItem();
        tvalue.name = new MLString(tvalue.name);
        tvalue.decription = new MLString(tvalue.description);
        this.state = {
            value: tvalue,
            isChanged: false
        };
    }

    langRef: RefObject<HTMLSelectElement> = React.createRef();
    groupsRef: RefObject<HTMLInputElement> = React.createRef();
    nameRef: RefObject<MLStringEditor> = React.createRef();
    descRef: RefObject<MLStringEditor> = React.createRef();
    urlRef: RefObject<HTMLTextAreaElement> = React.createRef();
    typeRef: RefObject<HTMLSelectElement> = React.createRef();
    blockedRef: RefObject<HTMLInputElement> = React.createRef();
    flowerRef: RefObject<Flower> = React.createRef();

    revert() {
        const tvalue = this.props.default_value?JSON.parse(JSON.stringify(this.props.default_value)):this.newItem();
        tvalue.name = new MLString(tvalue.name);
        tvalue.description = new MLString(tvalue.description);
        const nState: IItemFormState = {
            value: tvalue,
            isChanged: false
        }
        this.setState(nState);
    }

    newItem (): any {
        const item: any = {};
        item.organizationid = this.props.orgid;
        item.name = "";
        item.description = "";
        item.language = MLString.getLang();
        item.url = "";
        item.source = "web";
        item.tags = [];
        item.restrictions = [];
        item.type = "image";
        return item;
    }
            
    updateAttribute(attrName: string, event: any) {
        const nState: IItemFormState = this.state;

        switch (attrName) {
            case 'groups':
                nState.value[attrName] = event.currentTarget.value.split(';');
                break;

            case 'url':
            case 'type':
            case 'language':
                nState.value[attrName] = event.currentTarget.value;  
                break;

            case 'blocked':
                nState.value[attrName] = event.currentTarget.checked;  
                break;
            
            case 'description':
            case 'name':
                nState.value[attrName] = event;  
                break;
        }
        nState.isChanged = true;
        this.setState(nState);
    }
    
    render(): React.ReactNode {
        const item = this.state.value;
        return <div className="content-item-form">
            <span className={`content-item-changed-status ${this.state.isChanged?'':'changes-saved'}`}>Item {this.state.isChanged?"changed":"saved"}</span>
            <div>
                <MLStringEditor caption="Name" defaultValue={item.name} ref={this.nameRef} onChange={this.updateAttribute.bind(this, 'name')}/>
                <MLStringEditor caption="Description" defaultValue={item.description} ref={this.descRef} onChange={this.updateAttribute.bind(this, 'description')}/>
                Lang<select ref={this.langRef} defaultValue={item.language} onChange={this.updateAttribute.bind(this, 'language')}>
                    <option value='en'>en</option>
                    <option value='fr'>fr</option>
                    <option value='es'>es</option>
                    <option value='de'>de</option>
                    <option value='uk'>uk</option>
                    <option value='ru'>ru</option>
                    <option value='it'>it</option>
                </select>

                <span> | </span><span>Type</span><select ref={this.typeRef} defaultValue={item.type} onChange={this.updateAttribute.bind(this, 'type')}>
                    <option value='image'>image</option>
                    <option value='text'>text</option>
                </select>

                <span> | </span><input type="checkbox" ref={this.blockedRef} defaultChecked={item.blocked} onChange={this.updateAttribute.bind(this, 'blocked')}/><span>Blocked</span>

                <span> | </span><span>Groups<input ref={this.groupsRef} defaultValue={item.groups?.map((v: any)=>v.name).join(';')} onChange={this.updateAttribute.bind(this, 'groups')}/></span>
            </div>
            <div className="">
                Url <textarea ref={this.urlRef} defaultValue={item.url} onChange={this.updateAttribute.bind(this, 'url')}/></div>
                    
            {item.type==='image'?
            <div className="img-to-center">
                <img key={`img_${Math.random()}`} className="content-fit-to" src={item.url} alt={item.description}/>
            </div>
            :<></>}
        </div>;
    }
}

interface IContentItemProps {
    item: any;
    onSelect: (v: any)=>void;
    selected: boolean;
}

interface IContentItemState {

}

export class ContentItem extends React.Component<IContentItemProps, IContentItemState> {
    render(): React.ReactNode {
        const today = new Date().getTime();
        const changed = new Date(this.props.item.changed).getTime();
        let delta = (today - changed)/1000;
        let deltastr = "just now";
        if (delta > 60) {
            delta = delta / 60;
            if (delta < 60) deltastr = `${Math.round(delta)} mins ago`
            else {
                delta = delta / 60;
                if (delta < 24) deltastr = `${Math.round(delta)} hours ago`
                else {
                    delta = delta / 24;
                    if (delta < 365) deltastr = `${Math.round(delta)} days ago`
                    else deltastr = `More year ago`
                }
            }
        } 
        return (
        <span className={`content-item-container ${this.props.selected?'selected':''}`} onClick={()=>this.props.onSelect(this.props.item)}>
            <div className="content-item-type">{this.props.item.type}</div>
            <div className={`content-item-header`}>{this.props.item.name}</div>
            <div className="content-item-desc">{this.props.item.description}</div>
            <div className="content-item-time-label">changed: {deltastr}</div>
        </span> 
        )};
}

