import React, { RefObject } from 'react';
import { IServerInfo, PlutchikError, serverCommand } from '../../common';
import './assess.css'
import Emotion, { EmotionType, Flower, emotions } from '../emotion/emotion';
import Pending from '../pending/pending';
interface IAssessProps {
    serverInfo: IServerInfo;
    userInfo: any;
    onError: (err: PlutchikError)=>void;
    onInsights: ()=>void;
    pending?: RefObject<Pending>
}

interface IAssessState {
    contentitem: any;
}

export default class Assess extends React.Component<IAssessProps, IAssessState> {
    state: IAssessState = {
        contentitem: undefined,
    }
    vector: Map<EmotionType, number>;
    flowerRef: RefObject<Flower>;
    emotionRefs: Map<EmotionType, RefObject<Emotion>>;
    constructor(props: any) {
        super(props);
        this.vector = new Map<EmotionType, number>();
        this.flowerRef = React.createRef();
        this.emotionRefs = new Map();
        emotions.map((v, i)=>this.emotionRefs.set(v, React.createRef()));
    }

    componentDidMount(): void {
        this.getNext();
    }
    getNext() {
        this.vector.clear();
        this.flowerRef.current?.setState({});
        this.props.pending?.current?.incUse();
        serverCommand('getnextcontentitem', this.props.serverInfo, undefined, res=>{
            this.setState({
                contentitem: res,
            });
            this.emotionRefs.forEach((v, k)=>v.current?.setState({value: 0}));
            this.props.pending?.current?.decUse();
        }, err=>{
            if (err.code === "notfound" ) {
                this.setState({
                    contentitem: undefined,
                });
            } else {
                this.props.onError(err);
            }
            this.props.pending?.current?.decUse();
        })
    }

    sendAssessment(){
        if (this.state.contentitem === undefined) return;
        const vector: any = {};
        this.vector.forEach((v, e)=>vector[e] = v);
        const assessinfo = {
            cid: this.state.contentitem._id,
            vector: vector
        }
        this.props.pending?.current?.incUse();
        serverCommand('addassessment', this.props.serverInfo, JSON.stringify({
            assessmentinfo: assessinfo
        }), (res: any)=>{
            this.getNext();
            this.props.pending?.current?.decUse();
        }, (err: PlutchikError)=>{
            this.props.onError(err);
            this.props.pending?.current?.decUse();
        });
    }

    render(): React.ReactNode {
        return (<>
            {this.state.contentitem?<><div className='assess-header'>
                <Flower vector={this.vector} ref={this.flowerRef}/>
                <span>{this.state.contentitem?.name}</span>
            </div></>:<div></div>}
            {this.state.contentitem?<div className='assess-content'>
                <div>
                    {this.state.contentitem?.type === 'image'?<div className='image-center'><img className='fit-to' alt={this.state.contentitem.description} src={this.state.contentitem.url}/></div>
                    :
                    <span>{this.state.contentitem.description}</span>}
                </div>
                <div className='assess-control-panel'>
                <div className='assess-control-emotions'>
                {emotions.map((v, i)=><Emotion viewmode='slider' emotion={v} ref={this.emotionRefs.get(v)} disabled={false} key={i} onChange={(val: number)=>{
                    this.vector.set(v, val);
                    this.flowerRef.current?.setState({});
                }}/>)}
                </div>
                <div className='assess-control-buttons'>
                <button onClick={(e)=>this.sendAssessment()}>Assess and get next</button><button onClick={e=>{
                    this.getNext();

                }}>Skip</button><button>Report</button><button onClick={()=>{
                    this.props.onInsights();
                }}>Insights</button>
                </div>
                </div>
            </div>:
            <div>Sorry that's all</div>}
        </>);
    }
}