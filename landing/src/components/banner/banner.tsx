import React from "react";
import { ReactNode } from "react";
import "./banner.css"

export interface BannerProps {

}

export interface BannerState {

}

export default class Banner extends React.Component<BannerProps, BannerState> {
    render(): ReactNode {
        return <span className="banner-container">
            Banner
        </span>
    }
}