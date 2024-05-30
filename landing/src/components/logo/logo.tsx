import React from "react";
import "./logo.css"

export interface LogoProps {

}

export interface LogoState {

}

export default class Logo extends React.Component<LogoProps, LogoState> {
    render(): React.ReactNode {
        return <span className="logo-container">
            PLUTCHART
        </span>
    }
}