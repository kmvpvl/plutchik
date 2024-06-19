import MLString, { IMLString } from '../../model/mlstring';
import './mlstring.css';
import React from 'react';

type IMLStringEditorProps = {
    caption: string;
    defaultValue?: MLString;
    onChange?: (val: MLString) =>void;
}

type IMLStringEditorState = {
    value: MLString;
}

export class MLStringEditor extends React.Component<IMLStringEditorProps, IMLStringEditorState> {
    state: IMLStringEditorState = {
        value: this.props.defaultValue?this.props.defaultValue:new MLString('')
    }

    defaultInputRef: React.RefObject<HTMLInputElement> = React.createRef();
    
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
                const bvalue = this.state.value;
                bvalue.values.set('', '');
                //this.state.value.default = bvalue;
                if (this.props.onChange) this.props.onChange(bvalue);
                this.setState({value: bvalue});
            }}>+</button><input placeholder="Type in default language" onChange={(e)=>{
                const d: IMLString = this.value.toJSON();
                d.default = e.currentTarget.value;
                if (this.props.onChange) this.props.onChange(new MLString(d));
        }}defaultValue={this.state.value.default} ref={this.defaultInputRef}/></span>
            <span >
                {Array.from(this.state.value.values).map(([l, s], k)=><div key={k} className='mlstring-values'>
                <span><button onClick={(e)=>{
                    const d: IMLString = this.value.toJSON();
                    d.default = this.state.value.values.get(l) as string;
                    this.value = new MLString(d);
                    if (this.defaultInputRef.current) this.defaultInputRef.current.value = d.default
                    if (this.props.onChange) this.props.onChange(new MLString(d));
                }}>^</button><button onClick={(e)=>{
                    this.state.value.values.delete(l);
                    if (this.props.onChange) this.props.onChange(this.value);
                    this.setState(this.state);
                }}>-</button></span>
                <input placeholder='Type language' onChange={(e)=>{
                    const oldv = this.state.value.values.get(l);
                    this.state.value.values.delete(l);
                    this.state.value.values.set(e.currentTarget.value, oldv as string);
                    if (this.props.onChange) this.props.onChange(this.value);
                    this.setState(this.state);
                }} value={l}/><input placeholder='Type here value in language' onChange={(e)=>{
                    this.state.value.values.set(l, e.currentTarget.value);
                    if (this.props.onChange) this.props.onChange(this.value);
                }}value={s}/>
                </div>)}
            </span>
        </span>;
    }
}