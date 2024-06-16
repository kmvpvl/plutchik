import './emotion.css';
import React, { RefObject } from 'react';
export type EmotionType = 'joy' | "trust" | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
export type EmotionViewModeType = "slider" | "chart";
interface IEmotionProps {
    emotion: EmotionType;
    value?: number;
    disabled: boolean;
    viewmode: EmotionViewModeType;
    onChange?: (value: number)=>void;
}
export const emotions: EmotionType[] = ['joy','trust','fear','surprise','sadness','disgust','anger','anticipation'];

interface IEmotionState {
    value: number;
}

export default class Emotion extends React.Component<IEmotionProps, IEmotionState> {
    state: IEmotionState = {
        value: 0
    }
    svgRef: RefObject<SVGSVGElement> = React.createRef();
    width?: number;
    height?: number;
    componentDidMount(): void {
        this.width = this.svgRef.current?.width.baseVal.value;
        this.height = this.svgRef.current?.height.baseVal.value;
    }
    render(): React.ReactNode {

        let y;
        let h;

        switch (this.props.viewmode) {
            case "chart":
                let v = this.props.value;
                v = v?v:0;
                y = `${(1 - v) * 100}%`;
                h = `${v*100}%`;
                break;

            case "slider":
            default:
                y = "0";
                h = "100%";
        }
        return <>
        <svg ref={this.svgRef} xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width='100%' height='100%' className='emotion-slider'>
            {this.props.viewmode === "chart"?<rect className="dotted" x="0.5em" y="0" width="0.5em" height="100%"/>:<></>}
            <rect style={{fill: `var(--${this.props.emotion}-color)`}} x="0.5em" y={y} width="0.5em" height={h}/>
            {this.props.viewmode === 'slider'?<rect className={this.props.emotion} x="-0" y={`calc(${(1 - this.state.value) * 100}% - ${1 - this.state.value}em)`} width="1.5em" height="1em" rx="0.5em"/>:<></>}
            <g className='assess-emotion-text' ><text style={{color: `var(--${this.props.emotion}-color)`}} x="0" y="100%">{this.props.emotion}</text></g>
        </svg>
        </>;
    }
}

interface IFlowerProps {
    vector?: Map<EmotionType, number>
    width: string;
}

interface IFlowerState {

}

export class Flower extends React.Component<IFlowerProps, IFlowerState> {
    render(): React.ReactNode {
        const w = 100;
        return <span className='flower-container'>
        <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width={this.props.width} height={this.props.width} viewBox={`-${w/2} -${w/2} ${w} ${w}`}>
            {emotions.map((v, i)=> {
                const N = 8;
                let R;
                const vi = this.props.vector?.get(emotions[i]);
                const axis = vi;
                if (!axis) R = w/2;
                else R = axis * w/2;
                const r = R * 0.7;
                const av = 2 * Math.PI * i / N;
                const xv = Math.round(R * Math.sin(av));
                const yv = -Math.round(R * Math.cos(av));
                const ac1 = 2 * Math.PI * i / N + Math.PI/N;
                const ac2 = 2 * Math.PI * i / N - Math.PI/N;
                const xc1 = Math.round(r * Math.sin(ac1));
                const xc2 = Math.round(r * Math.sin(ac2));
                const yc1 = -Math.round(r * Math.cos(ac1));
                const yc2 = -Math.round(r * Math.cos(ac2));
                return <path key={i} style={{fill: axis?`var(--${v}-color)`:'transparent', stroke: 'gray'}} d={`M 0,0 L ${xc1},${yc1} Q ${xv},${yv} ${xc2},${yc2} L 0,0, z`}/>
            })}
        </svg>
        </span>;
    }
}

export interface EmotionVector {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
}

interface IChartsProps {
    vector: EmotionVector
}
interface IChartsState {

}

export class Charts extends React.Component<IChartsProps, IChartsState> {
    render(): React.ReactNode {
        return <>
        <div className='charts-emotions'>
            {emotions.map((v, i)=>{
                let val: number | undefined = this.props.vector[emotions[i]];
                val = val?val:0;
                return <Emotion viewmode='chart' disabled={false} value={val} emotion={emotions[i]} key={i}/>
            })}
        </div>
        </>;
    }
}
