import React, { RefObject } from "react";
import { IServerInfo, PlutchikError, serverCommand } from "../../common";
import './content.css';
import { EmotionType, Flower, emotions } from "../emotion/emotion";
import Pending from "../pending/pending";
export interface IContentItemsProps {
    serverInfo: IServerInfo;
    uid: string;
    oid: string;
    onSuccess: (text: string)=>void;
    onError: (err: PlutchikError)=>void;
    pending?: RefObject<Pending>;
}

export interface IContentItemsState {
    items: any[];
    currentItem: any;
    currentItemStat: Map<EmotionType, number>;
    currentItemAssessmentsCount: number
}

export class ContentItems extends React.Component<IContentItemsProps, IContentItemsState> {
    state = {
        items: [],
        currentItem: {} as any,
        currentItemStat: new Map<EmotionType, number>(),
        currentItemAssessmentsCount: NaN
    }
    langRef: RefObject<HTMLSelectElement> = React.createRef();
    groupsRef: RefObject<HTMLInputElement> = React.createRef();
    nameRef: RefObject<HTMLInputElement> = React.createRef();
    descRef: RefObject<HTMLTextAreaElement> = React.createRef();
    urlRef: RefObject<HTMLTextAreaElement> = React.createRef();
    typeRef: RefObject<HTMLSelectElement> = React.createRef();
    blockedRef: RefObject<HTMLInputElement> = React.createRef();
    flowerRef: RefObject<Flower> = React.createRef();
    
    loadContentItems() {
        this.props.pending?.current?.incUse();
        serverCommand(`getorgcontent`, this.props.serverInfo, JSON.stringify({oid: this.props.oid}), res=>{
            const nState: IContentItemsState = this.state;
            nState.items = res;
            nState.currentItem = undefined;
            this.setState(nState);
            this.props.pending?.current?.decUse();
        }, err=>{
            this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }
    
    componentDidMount(): void {
        this.loadContentItems();
    }
    
    componentDidUpdate(prevProps: Readonly<IContentItemsProps>, prevState: Readonly<IContentItemsState>, snapshot?: any): void {
        if (prevProps.oid !== this.props.oid) this.loadContentItems();
    }
    
    onSaveForm(e: any) {
        let ci: any;
        if (this.state.currentItem) {
            ci = this.state.currentItem;
        } else {
            ci = {
                organizationid: this.props.oid,
                source: "web",
                tags: [],
                restrictions: [],
              }            
        }
        ci.groups = this.groupsRef.current?.value.split(';');
        if (ci.groups.length === 1 && ci.groups[0] === '') delete ci.groups;
        ci.language = this.langRef.current?.value;
        ci.name = this.nameRef.current?.value;
        ci.description = this.descRef.current?.value;
        ci.url = this.urlRef.current?.value;
        ci.type = this.typeRef.current?.value;
        ci.blocked = this.blockedRef.current?.checked;
        this.props.pending?.current?.incUse();
        serverCommand('addcontent', this.props.serverInfo, JSON.stringify({
            contentinfo: ci
        }), res=>{
            this.props.onSuccess(`Success!\n${JSON.stringify(res)}`);
            this.loadContentItems();
            this.props.pending?.current?.decUse();
        }, err=>{
            this.props.onError(err);
            this.props.pending?.current?.decUse();
        })
    }
    render(): React.ReactNode {
        return (
            <div className="content-container">
                <span>Content<button onClick={(e: any)=>{
                    const nState: IContentItemsState = this.state;
                    nState.currentItem = undefined;
                    this.setState(nState);
                }}>📄</button></span>
                {this.state.items.length > 0?<div className="content-items">{this.state.items.map((v: any, i)=>
                    <ContentItem key={i} item={v} selected={v._id === this.state.currentItem?._id} onSelect={v=>{
                        const nState: IContentItemsState = this.state;
                        nState.currentItem = v;
                        nState.currentItemStat = new Map<EmotionType, number>();
                        nState.currentItemAssessmentsCount = NaN;
                        this.setState(nState);
                        this.props.pending?.current?.incUse();
                        serverCommand('getcontentstatistics', this.props.serverInfo, JSON.stringify({
                            cid: v._id
                        }), (res)=>{
                            const nState: IContentItemsState = this.state;
                            for (const i in emotions) {
                                nState.currentItemStat.set(emotions[i], res[emotions[i]]);
                            }
                            nState.currentItemAssessmentsCount = res.count;
                            this.setState(nState);
                            this.props.pending?.current?.decUse();
                        }, (err: PlutchikError)=>{
                            this.props.onError(err);
                            this.props.pending?.current?.decUse();
                        });
                    }}/>)}
                </div>:<div></div>}
                
                {this.state.currentItem?._id?<div className="content-form">
                    <div className="content-form-tools"><button onClick={(e)=>this.onSaveForm(e)}>Save</button>
                        <Flower ref={this.flowerRef} vector={this.state.currentItemStat}/> <span>Count: {this.state.currentItemAssessmentsCount}</span>
                    </div>
                    <div>
                        Name <input key={`${this.state.currentItem._id}_1`} ref={this.nameRef} defaultValue={this.state.currentItem.name}/>
                        
                        Lang <select key={`${this.state.currentItem._id}_2`} ref={this.langRef} defaultValue={this.state.currentItem.language}>
                            <option value='en'>en</option>
                            <option value='uk'>uk</option>
                            <option value='es'>es</option>
                            <option value='de'>de</option>
                            <option value='ru'>ru</option>
                        </select>

                        Type <select key={`${this.state.currentItem._id}_3`} ref={this.typeRef} defaultValue={this.state.currentItem.type}>
                            <option value='image'>image</option>
                            <option value='text'>text</option>
                        </select>

                        Blocked <input type="checkbox" key={`${this.state.currentItem._id}_7`} ref={this.blockedRef} defaultChecked={this.state.currentItem.blocked}/>

                        Groups <input key={`${this.state.currentItem._id}_6`} ref={this.groupsRef} defaultValue={this.state.currentItem.groups.map((v: any)=>v.name).join(';')}/>
                    </div>
                    <div>
                        Desc <textarea key={`${this.state.currentItem._id}_4`} ref={this.descRef} defaultValue={this.state.currentItem.description}/></div>
                    <div className="">
                        Url <textarea key={`${this.state.currentItem._id}_5`} ref={this.urlRef} defaultValue={this.state.currentItem.url}/></div>
                    
                    {this.state.currentItem.type==='image'?<img className="content-fit-to" src={this.state.currentItem.url} alt={this.state.currentItem.description}/>:<></>}
                </div>
                :
                <div className="content-form">
                    <div><button onClick={(e)=>this.onSaveForm(e)}>Save</button></div>
                    <div>
                        Name <input key={`${'new'}_1`} ref={this.nameRef} defaultValue={''}/>
                        
                        Lang <select key={`${'new'}_2`} ref={this.langRef}>
                            <option value='en'>en</option>
                            <option value='uk'>uk</option>
                            <option value='es'>es</option>
                            <option value='de'>de</option>
                            <option value='ru'>ru</option>
                        </select>

                        Type <select key={`${'new'}_3`} ref={this.typeRef} defaultValue={'image'}>
                            <option value='image'>image</option>
                            <option value='text'>text</option>
                        </select>

                        Blocked <input type="checkbox" key={`${'new'}_7`} ref={this.blockedRef} defaultChecked={false}/>
                        Groups <input key={`${'new'}_6`} ref={this.groupsRef} defaultValue={''}/>
                    </div>
                    <div>
                        Desc <textarea key={`${'new'}_4`} ref={this.descRef} defaultValue={''}/></div>
                    <div>
                        Url <textarea key={`${'new'}_5`} ref={this.urlRef} defaultValue={''}/></div>
                    <div>
                    </div>
                    
                    <img className="content-fit-to" alt={''}/>
                </div>}
            </div>
        );
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

