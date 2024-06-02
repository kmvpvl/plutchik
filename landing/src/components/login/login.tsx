import { ReactNode } from "react";
import "./login.css";
import React from "react";
import MLString from "../mlstrings";
export interface LoginProps {
    onLanguageChanged: (newLang: string)=>void;
}

export interface LoginState {
    language: string;
    lang_choosing: boolean; 
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
    state:LoginState  = {
        language: MLString.getLang(),
        lang_choosing: false
    };
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
    private callOnLanguageChanged(lang: string) {
        this.setState({language: lang, lang_choosing: false})
        this.props.onLanguageChanged(lang);
    }
    render(): ReactNode {
        return <span className="login-container">
            <span>
                <button>{strSignIn.toString()}</button>
                <br/><br/>
                <button>{strSignUp.toString()}</button>
            </span>
            {this.state.lang_choosing?<span className="login-language choosing" onMouseLeave={()=>this.setState({})}>
            <span onClick={()=>this.callOnLanguageChanged('en')}>🇬🇧</span>
            <span onClick={()=>this.callOnLanguageChanged('fr')}>🇫🇷</span>
            <span onClick={()=>this.callOnLanguageChanged('de')}>🇩🇪</span>
            <span onClick={()=>this.callOnLanguageChanged('es')}>🇪🇸</span>
            <span onClick={()=>this.callOnLanguageChanged('uk')}>🇺🇦</span>
            <span onClick={()=>this.callOnLanguageChanged('ru')}>🇷🇺</span>
            </span>:<></>}
            <span className="login-language" onClick={()=>{
                this.setState({
                    language: this.state.language,
                    lang_choosing: true
                    });
                }}>{this.state.lang_choosing?"":this.getLangEmoji()}
            </span>
        </span>
    }
}