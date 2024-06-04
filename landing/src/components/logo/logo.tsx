import React from "react";
import "./logo.css"

export interface LogoProps {

}

export interface LogoState {

}

export default class Logo extends React.Component<LogoProps, LogoState> {
    render(): React.ReactNode {
        return <span className="logo-container">
            <span className="logo-center">
                <span className="logo-letters-container">PLUT<img src="plutchart_logo.svg" alt="" height="30px"></img>CHART</span>
            </span>
        </span>
    }
}