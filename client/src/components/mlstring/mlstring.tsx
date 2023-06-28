import MLString, { IMLString } from '../../model/mlstring';
import './mlstring.css';
import React from 'react';

type IMLStringEditorProps = {
    caption: string;
    defaultValue?: MLString;
}

type IMLStringEditorState = {
    value: MLString;
}

export class MLStringEditor extends React.Component<IMLStringEditorProps, IMLStringEditorState> {
    r: number;
    constructor(props: IMLStringEditorProps) {
        super(props);
        this.state = {
            value: props.defaultValue?props.defaultValue:new MLString('')
        }
        this.r = Math.round(Math.random() * 1000);
    }
    
    get value() {
        return this.state.value;
    }
    set value(v: MLString) {
        this.setState({value: v});
    }
    render(): React.ReactNode {
        return <span className='mlstring-container'>
            <span className='mlstring-caption'>{this.props.caption}</span>
            <span className='mlstring-default'><button onClick={()=>{
                this.state.value.values.set('', '');
                this.setState(this.state);
            }}>[+]</button><input key={`${this.r}_default`} onChange={(e)=>{
                const d: IMLString = this.value.toJSON();
                d.default = e.currentTarget.value;
                this.value = new MLString(d);
        }}defaultValue={this.state.value.default}/></span>
            <span >
                {Array.from(this.state.value.values).map(([l, s], k)=><div key={k} className='mlstring-values'>
                <span><button onClick={(e)=>{
                    this.r = Math.round(Math.random() * 1000);
                    const d: IMLString = this.value.toJSON();
                    d.default = this.state.value.values.get(l) as string;
                    this.value = new MLString(d);
                }}>^</button><button onClick={(e)=>{
                    this.state.value.values.delete(l);
                    this.setState(this.state);
                }}>X</button></span>
                <input key={`${this.r}_k_lang`} onChange={(e)=>{
                    const oldv = this.state.value.values.get(l);
                    this.state.value.values.delete(l);
                    this.state.value.values.set(e.currentTarget.value, oldv as string);
                    this.setState(this.state);
                }} defaultValue={l}/><input  key={`${this.r}_k_val`} onChange={(e)=>{
                    this.state.value.values.set(l, e.currentTarget.value);
                }}defaultValue={s}/>
                </div>)}
            </span>
        </span>;
    }
}