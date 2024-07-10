import React from "react";
import { ReactNode } from "react";
import "./banner.css"
import MLString from "./../mlstrings";

export interface BannerProps {

}

export interface BannerState {

}

const strSlogans = [
    new MLString({
        default: "LOVE = JOY + TRUST", 
        values: new Map([
            ["en-US", "LOVE = JOY + TRUST"],
            ["de", "LIEBE = FREUDE + VERTRAUEN"],
            ["fr", "AMOUR = JOIE + CONFIANCE"],
            ["es", "AMOR = ALEGRÍA + CONFIANZA"],
            ["uk", "ЛЮБОВ = РАДІСТЬ + ДОВІРА"],
            ["ru", "ЛЮБОВЬ = РАДОСТЬ + ДОВЕРИЕ"]])
    }), 
    new MLString({
        default: "OPTIMISM = ANTICIPATION + JOY", 
        values: new Map([
            ["en-US", "OPTIMISM = ANTICIPATION + JOY"],
            ["de", "OPTIMISMUS = VORFREUDE + FREUDE"],
            ["fr", "OPTIMISME = ANTICIPATION + JOIE"],
            ["es", "OPTIMISMO = ANTICIPACIÓN + ALEGRÍA"],
            ["uk", "ОПТИМІЗМ = ПЕРЕДЧІКУВАННЯ + РАДОСТІ"],
            ["ru", "ОПТИМИЗМ = ПРЕДВКУШЕНИЕ + РАДОСТЬ"]])
    })
    ,new MLString({
        default: "AGGRESSIVENESS = ANGER + ANTICIPATION", 
        values: new Map([
            ["en-US", "AGGRESSIVENESS = ANGER + ANTICIPATION"],
            ["de", "AGGRESSIVITÄT = WUT + ERWARTUNG"],
            ["fr", "AGRESSIVITÉ = COLÈRE + ANTICIPATION"],
            ["es", "AGRESIVIDAD = IRA + ANTICIPACIÓN"],
            ["uk", "АГРЕСИВНІСТЬ = ОЧІКУВАННЯ + ГНІВУ"],
            ["ru", "АГРЕССИВНОСТЬ = ПРЕДВКУШЕНИЕ + ГНЕВ"]])
    })
    ,new MLString({
        default: "CONTEMPT = ANGER + DISGUST", 
        values: new Map([
            ["en-US", "CONTEMPT = ANGER + DISGUST"],
            ["de", "Verachtung = Wut + Abscheu"],
            ["fr", "Mépris = colère + dégoût"],
            ["es", "DESPEÑO = IRA + ASCO"],
            ["uk", "ЗНЕГРА = ГНІВ + ОГИДА"],
            ["ru", "ПРЕЗРЕНИЕ = ГНЕВ + ОТВРАЩЕНИЕ"]])
    })
    ,new MLString({
        default: "REMORSE = DISGUST + SADNESS", 
        values: new Map([
            ["en-US", "REMORSE = DISGUST + SADNESS"],
            ["de", "Reue = Ekel + Traurigkeit"],
            ["fr", "REMORDS = DÉGOUT + TRISTESSE"],
            ["es", "ARREPENTIMIENTO = ASCO + TRISTEZA"],
            ["uk", "КАЙТТЯ = ОГИДА + СУМ"],
            ["ru", "РАСКАЯНИЕ = ОТВРАЩЕНИЕ + ПЕЧАЛЬ"]])
    })
    ,new MLString({
        default: "DISAPPRUVAL = SADNESS + SURPRISE", 
        values: new Map([
            ["en-US", "DISAPPRUVAL = SADNESS + SURPRISE"],
            ["de", "Missbilligung = Traurigkeit + Überraschung"],
            ["fr", "DÉSAPPRUBATION = TRISTESSE + SURPRISE"],
            ["es", "DESAPROBACIÓN = TRISTEZA + SORPRESA"],
            ["uk", "НЕПРИХВЛЕННЯ = СУМ + ПОДИВУВАННЯ"],
            ["ru", "РАЗОЧАРОВАНИЕ = ПЕЧАЛЬ + УДИВЛЕНИЕ"]])
    })
];

export default class Banner extends React.Component<BannerProps, BannerState> {
    private getRandomSlogan(): MLString {
        return strSlogans[Math.floor(Math.random() * strSlogans.length)];
    }
//             LOVE = <span style={{WebkitTextStrokeColor: 'var(--joy-color)'}}>JOY</span> + <span style={{WebkitTextStrokeColor: 'var(--trust-color)'}}>TRUST</span>

    render(): ReactNode {
        return <span className="banner-container">
            <span className="banner-slogan">{this.getRandomSlogan().toString().toLocaleUpperCase()}</span>
        </span>
    }
}