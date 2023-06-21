import './emotion.css';
import React, { RefObject } from 'react';
export type EmotionType = 'joy' | "trust" | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';
interface IEmotionProps {
    emotion: EmotionType;
    disabled: boolean;
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
        return <>
        <svg ref={this.svgRef} xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width='100%' height='100%' className='emotion-slider'>
            <rect className={this.props.emotion} style={{cursor:'pointer'}} x="0.5em" y="0" width="0.5em" height="100%" onClick={(e)=>{
                //debugger;
                const y = e.clientY;
                const rect = e.currentTarget.getBoundingClientRect();
                const v = 1 - (y - rect.top)/(rect.bottom - rect.top);
                this.setState({
                    value: v
                });
                if (this.props.onChange) this.props.onChange(v);
            }}/>
            <rect className={this.props.emotion} x="-0" y={`calc((100% - 1em)*${1 - this.state.value})`} width="1.5em" height="1em" rx="0.5em"/>
            <text className={`${this.props.emotion} assess-emotion-text`} x="0" y="0">{this.props.emotion}</text>
        </svg>
        </>;
    }
}

interface IFlowerProps {
    vector?: Map<EmotionType, number>
}

interface IFlowerState {

}

export class Flower extends React.Component<IFlowerProps, IFlowerState> {
    render(): React.ReactNode {
        const w = 75;
        return <>
        <svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' width='100%' height='100%' viewBox={`-${w/2} -${w/2} ${w} ${w}`}>
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
                return <path key={i} className={axis?v:'dotted'} d={`M 0,0 L ${xc1},${yc1} Q ${xv},${yv} ${xc2},${yc2} L 0,0, z`}/>
            })}
        </svg>
        </>;
    }
}
