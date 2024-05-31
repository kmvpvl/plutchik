import { ReactNode } from "react";
import "./login.css";
import React from "react";
import MLString from "../mlstrings";
export interface LoginProps {

}

export interface LoginState {
    language: string;
}

const strSignIn = new MLString({
    default: "Sign in", 
    values: new Map([
        ["en-US", "Sign in"],
        ["de", "Anmelden"],
        ["fr", "Se connecter"],
        ["es", "Iniciar sesión"],
        ["uk", "Увійти"],
        ["ru", "Войти"]])
});
  
const strSignUp = new MLString({
    default: "Sign up", 
    values: new Map([
        ["en-US", "Sign up"],
        ["de", "Melden Sie sich an"],
        ["fr", "S'inscrire"],
        ["es", "Inscribirse"],
        ["uk", "Зареєструватися"],
        ["ru", "Зарегистрироваться"]])
});


export default class Login extends React.Component<LoginProps, LoginState> {
    state:LoginState  = {language: MLString.getLang()};
    private getLangEmoji(): string {
        switch(this.state.language.split('-')[0]) {
            case 'ru': return '🇷🇺';
            case 'es': return '🇪🇸';
            case 'de': return '🇩🇪';
            case 'uk': return '🇺🇦';
            case 'fr': return '🇫🇷';
            case 'en':
            default: return '🇬🇧'
        }
    }
    render(): ReactNode {
        return <span className="login-container">
            <button>{strSignIn.toString()}</button><span className="login-language">{this.getLangEmoji()}</span>
            <br/><br/>
            <button>{strSignUp.toString()}</button>
        </span>
    }
}