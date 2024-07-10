import { ReactNode } from "react";
import "./label.css";
import React from "react";

export interface ILabelProps {
    caption: string;
    value: string;
    gridArea?: string;
}

export interface ILabelState {

}

export default class Label extends React.Component<ILabelProps, ILabelState> {
    render(): ReactNode {
        return <span className="label-container" style={{gridArea: this.props.gridArea}}>
            <span className="label-value">{this.props.value}</span>
            <span className="label-caption">{this.props.caption}</span>
        </span>
    }
}