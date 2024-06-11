import React, { RefObject } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../model/common";
import './content.css';
import { EmotionType, Flower, emotions } from "../emotion/emotion";
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
    loadContentItems() {
        this.props.pending?.current?.incUse();
        serverCommand(`getorgcontent`, this.props.serverInfo, JSON.stringify({oid: this.props.orgid}), res=>{
            for (const i in res) {
                res[i].name = new MLString(res[i].name);
                res[i].description = new MLString(res[i].description);
            }
            const nState: IContentState = this.state;
            nState.items = res;
            nState.curItem = undefined;
            this.setState(nState);
            this.props.pending?.current?.decUse();
        }, err=>{
            if (this.props.onError) this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }
    saveItem(item: any) {
        if (item._id === undefined){
            item.organizationid = this.props.orgid;
            item.source = "web";
            item.tags = [];
            item.restrictions = []
        }
        this.props.pending?.current?.incUse();
        serverCommand('addcontent', this.props.serverInfo, JSON.stringify({
            contentinfo: item
        }), res=>{
            if (this.props.onSuccess) this.props.onSuccess(`Success!\n${JSON.stringify(res)}`);
            this.props.pending?.current?.decUse();
            this.itemFormRef.current?.setState({item: res, isChanged: false});
            //let's update element
            //debugger
/*            const el = this.state.items.filter(v=>v._id === res._id);
            if (el.length === 0) {
                this.state.items.push(res);
            } else {
                Object.assign(el[0], res);
            }
            const nState: IContentState = {
                curItem: res,
                items: this.state.items
            }
*/            //this.loadContentItems();
            //this.setState(nState);
        }, err=>{
            if (this.props.onError) this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }

    onSelectItem(selectedItem: any) {
        const nState: IContentState = this.state;
        if (this.itemFormRef.current?.state.isChanged) {
            alert('Item was changed. Save?')
        }
        // clone for editing
        const cloneObj: any = JSON.parse(JSON.stringify(selectedItem));
        cloneObj.name = new MLString(cloneObj.name);
        cloneObj.description = new MLString(cloneObj.description);
        nState.curItem = cloneObj;
        this.setState(nState);
        this.itemFormRef.current?.setState({item: cloneObj, isChanged: false})
    }
    onRevertItem() {
        const curItem = this.state.curItem;
        const el = this.state.items.filter(v=>curItem._id === v._id);
        if (el.length === 1) {
            const cloneObj: any = JSON.parse(JSON.stringify(el[0]));
            cloneObj.name = new MLString(cloneObj.name);
            cloneObj.description = new MLString(cloneObj.description);
    
            this.itemFormRef.current?.setState({item: cloneObj, isChanged: false})
        }
    }

    render(): React.ReactNode {
        const items = this.state.items;
        return <div className="content-container">
            <span className="content-label">Content of set editing</span>
            <span className="content-toolbar">
                <button>New item</button>
                <button>Remove item</button>
                <span>|</span>
                <button onClick={this.onRevertItem.bind(this)}>Revert item</button>
                <button onClick={this.saveItem.bind(this, this.state.curItem)}>Save item</button>
                <span>|</span>
                <button>Deep check set</button>
                <button>Analyze set</button>
            </span>
            <span className="content-area">
                <span className="content-items">
                    {items.length === 0?"No items in this set. Create one":items.map((v, i)=><ContentItem key={i} item={v} onSelect={this.onSelectItem.bind(this, v)} selected={this.state.curItem?._id === v._id}/>)}
                </span>
                {this.state.curItem?<ItemForm ref={this.itemFormRef} item={this.state.curItem} orgid={this.props.orgid}></ItemForm>:<span></span>}
            </span>
        </div>
    }
}

export interface IItemFormProps {
    orgid: string;
    pending?: RefObject<Pending>;
    item: any;
}

export interface IItemFormState {
    item: any;
    isChanged: boolean;
}

export class ItemForm extends React.Component<IItemFormProps, IItemFormState> {
    state = {
        item: this.props.item,
        isChanged: false
    }
    langRef: RefObject<HTMLSelectElement> = React.createRef();
    groupsRef: RefObject<HTMLInputElement> = React.createRef();
    nameRef: RefObject<MLStringEditor> = React.createRef();
    descRef: RefObject<MLStringEditor> = React.createRef();
    urlRef: RefObject<HTMLTextAreaElement> = React.createRef();
    typeRef: RefObject<HTMLSelectElement> = React.createRef();
    blockedRef: RefObject<HTMLInputElement> = React.createRef();
    flowerRef: RefObject<Flower> = React.createRef();
            
    clearContentForm() {
        if (this.nameRef.current) this.nameRef.current.value = new MLString("");
        if (this.descRef.current) this.descRef.current.value = new MLString("");
        if (this.urlRef.current) this.urlRef.current.value = "";
        const nState: IItemFormState = this.state;
        nState.item = this.props.item;            
        this.setState(nState);
    }

    updateAttribute(attrName: string, event: any) {
        const nState: IItemFormState = this.state;
        switch (attrName) {
            case 'groups':
                nState.item[attrName] = event.currentTarget.value.split(';');
                break;

            case 'url':
            case 'type':
            case 'blocked':
            case 'language':
                nState.item[attrName] = event.currentTarget.value;  
                break;
            
            case 'description':
            case 'name':
                nState.item[attrName] = event;  
                break;
        }
        nState.isChanged = true;
        this.setState(nState);
    }
    
    render(): React.ReactNode {
        const item = this.state.item;
        console.log(JSON.stringify(item));
        return <div className="content-item-form" key={Math.random()}>
            <div className="content-form-tools">
                <span>Item {this.state.isChanged?"changed":"saved"}</span>
                <span>Count: {}</span>
            </div>
            <div>
                <MLStringEditor key={`mlse${item?._id}`} caption="Name" defaultValue={item.name} ref={this.nameRef} onChange={this.updateAttribute.bind(this, 'name')}/>
                Lang <select key={`${item._id}_2`} ref={this.langRef} defaultValue={item.language} onChange={this.updateAttribute.bind(this, 'language')}>
                    <option value='en'>en</option>
                    <option value='fr'>fr</option>
                    <option value='es'>es</option>
                    <option value='de'>de</option>
                    <option value='uk'>uk</option>
                    <option value='ru'>ru</option>
                    <option value='it'>ru</option>
                </select>

                Type <select key={`${item._id}_3`} ref={this.typeRef} defaultValue={item.type} onChange={this.updateAttribute.bind(this, 'type')}>
                    <option value='image'>image</option>
                    <option value='text'>text</option>
                </select>

                Blocked <input type="checkbox" key={`${item._id}_7`} ref={this.blockedRef} defaultChecked={item.blocked} onChange={this.updateAttribute.bind(this, 'blocked')}/>

                Groups <input key={`${item._id}_6`} ref={this.groupsRef} defaultValue={item.groups?.map((v: any)=>v.name).join(';')} onChange={this.updateAttribute.bind(this, 'groups')}/>
            </div>
            <MLStringEditor key={`mlsd${item?._id}`} caption="Description" defaultValue={item.description} ref={this.descRef} onChange={this.updateAttribute.bind(this, 'description')}/>
            <div className="">
                Url <textarea key={`${item._id}_5`} ref={this.urlRef} defaultValue={item.url} onChange={this.updateAttribute.bind(this, 'url')}/></div>
                    
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
        return (
        <span className="content-item" onClick={()=>this.props.onSelect(this.props.item)}>
            <div className="content-item-type">{this.props.item.type}</div>
            <div className={`content-item-header ${this.props.selected?'selected':''}`}>{this.props.item.name}</div>
            <div className="content-item-desc">{this.props.item.description}</div>
        </span> 
        )};
}

