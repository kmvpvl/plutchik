import React from 'react';
import './pending.css';
type PendingType = "squares" | "shattle";
type IPendingProps = {
    color?: string;
    type?: PendingType;
}

type IPendingState = {
    useCount: number;
}

export default class Pending extends React.Component <IPendingProps, IPendingState>{
    state: IPendingState = {
        useCount:0,
    }
    incUse(){
        const nState: IPendingState = this.state;
        nState.useCount++;
        this.setState(nState);
    }
    decUse(){
        const nState: IPendingState = this.state;
        nState.useCount = nState.useCount===0?0:nState.useCount -1;
        this.setState(nState);
    }
    render(): React.ReactNode {
        if (this.state.useCount === 0) return <></>;
        switch(this.props.type) {
            case "shattle":
                return <>
                <div className='pending-container'>
                </div>
                <div className='pending-shattle-container'>
                    <span className='pending-shattle-point'></span>
                </div>
                </>;
            case 'squares':
            default:
                return <>
                <div className='pending-container'>
                </div>
                <div className='pending-squares-container'>
                    <span className='pending-squares-square' style={{transformOrigin:'left top'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'center top'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'right top'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'left center'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'center center'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'right center'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'left bottom'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'center bottom'}}></span>
                    <span className='pending-squares-square' style={{transformOrigin:'right bottom'}}></span>
                </div>
            </>;
        }
    }
}