import React from "react";
import { Emotion } from "../common";
import "./market.css"

export interface MarketProps {
    area: string;
    emotion: Emotion;
    caption: string;
    description: string;
}

export interface MarketState {

}

export default class Market extends React.Component<MarketProps, MarketState>{
    render(): React.ReactNode {
        return <span className="market-container" 
            style={{gridArea: this.props.area, backgroundColor: `var(--${this.props.emotion}-color)`}}>
            <span className="market-caption">{this.props.caption}</span>
            <span className="market-description">{this.props.description}</span>
        </span>
    }
}