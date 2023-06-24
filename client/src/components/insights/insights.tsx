import { IServerInfo, PlutchikError, serverCommand } from '../../common';
import { Charts, EmotionType, emotions } from '../emotion/emotion';
import './insights.css'
import React, { ReactNode } from 'react';

interface IInsightsProps {
    onAssess: ()=>void;
    serverInfo: IServerInfo;
    userInfo: any;
    onError: (err: PlutchikError)=> void;
}

interface IInsightsState {
    my_vector: Map<EmotionType, number>;
    others_vector: Map<EmotionType, number>;
    my_count?: number;
    others_count?: number;
}

export default class Insights extends React.Component<IInsightsProps, IInsightsState> {
    state: IInsightsState = {
        my_vector: new Map(),
        others_vector: new Map(),
        my_count: NaN,
        others_count: NaN
    }
    componentDidMount(): void {
        this.loadInsightsData();
    }
    loadInsightsData() {
        serverCommand('getinsights', this.props.serverInfo, undefined, res=>{
            const nState: IInsightsState = this.state;
            nState.my_count = res.ownVector.count;
            nState.others_count = res.othersVector.count;
            for (const i in emotions) {
                nState.my_vector.set(emotions[i], res.ownVector[emotions[i]]);
                nState.others_vector.set(emotions[i], res.othersVector[emotions[i]]);
            }
            this.setState(nState);
        }, err=> {
            const nState: IInsightsState = this.state;
            nState.my_count = NaN;
            nState.others_count = NaN;
            nState.my_vector.clear();
            nState.others_vector.clear();
            this.setState(nState);
            this.props.onError(err);
        })
    }
    render(): ReactNode {
        return <>
        <div></div>
        <div className='insights-content'>
            <div>Differences</div>
            <Charts key={'my'} vector={this.state.my_vector}/>
            <div>My emotions count:{this.state.my_count}</div>
            <Charts key={'others'} vector={this.state.others_vector}/>
            <div>Others emotions count:{this.state.others_count}</div>
            <div className='assess-control-buttons'><button onClick={()=>this.props.onAssess()}>Get next</button><button>Report</button></div>
        </div>
        </>;
    }
}
