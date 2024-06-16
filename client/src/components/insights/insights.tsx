import { Charts, EmotionVector } from '../emotion/emotion';
import './insights.css'
import React, { ReactNode } from 'react';

interface IInsightsProps {
    myvector: EmotionVector;
    mycount: number;
    othersvector: EmotionVector;
    otherscount: number;
}

interface IInsightsState {
}

export default class Insights extends React.Component<IInsightsProps, IInsightsState> {
    render(): ReactNode {
        return <div className='insights-container'>
        {this.props.mycount > 0?<>
            <div>User's and others' emptional vectors on set</div>
            <Charts key={'my'} vector={this.props.myvector} label={`User emotions count: ${this.props.mycount}`}/>
            <Charts key={'others'} vector={this.props.othersvector} label={`Others emotions count: ${this.props.mycount}`}/>
        </>:<div></div>}
        </div>
    }
}
