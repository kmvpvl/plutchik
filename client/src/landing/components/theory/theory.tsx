import React from "react";
import "./theory.css"
import MLString from "./../mlstrings";
export interface ITheoryProps {

}

export interface ITheoryState {

}
const strTheory = new MLString({
    default: "Conception overview", 
    values: new Map([
        ["en-US", "Conception overview"],
        ["de", "Konzeptübersicht"],
        ["fr", "Aperçu de la conception"],
        ["es", "Descripción general de la concepción"],
        ["uk", "Огляд концепції"],
        ["ru", "Обзор концепции"]])
});
export default class Theory extends React.Component<ITheoryProps, ITheoryState> {
    render(): React.ReactNode {
        return <div className="theory-container">
            <span className="theory-header">{strTheory.toString()}</span>
            <span className="theory-content">
                <span>Basic emotions</span>
                <iframe width="100%" height="320px" src="https://www.youtube.com/embed/nYmFs9nNlyI" title="The basic emotions" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>
                <span>Ancient emotions</span>
                <iframe width="100%" height="320px" src="https://www.youtube.com/embed/qi6stbobnFE" title="The basic emotions" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ></iframe>
            </span>
        </div>
    }
}