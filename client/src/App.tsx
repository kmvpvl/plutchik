import React from 'react';
import './App.css';
import TGLogin, { IServerInfo, LoginFormStates } from './components/loginForm';


export default class App extends React.Component {
    public tgLoginFormRef: React.RefObject<TGLogin>;
    constructor(props: any) {
        super(props);
        this.tgLoginFormRef = React.createRef();
    }
    onLoginStateChanged(oldState: LoginFormStates, newState: LoginFormStates, info: IServerInfo) {
        console.log(newState, info);
    }
    render(): React.ReactNode {
        return (
        <div className="App">
        <header className="App-header">
            <TGLogin ref={this.tgLoginFormRef} onStateChanged={this.onLoginStateChanged}/>
        </header>
        </div>
        );
    }
}

