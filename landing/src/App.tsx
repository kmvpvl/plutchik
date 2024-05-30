import React from 'react';
import './App.css';
import Logo from './components/logo/logo';
import Banner from './components/banner/banner';
import Market from './components/market/market';
import MLString from './mlstrings';
import Manifest from './components/manifest/manifest';

export interface AppProps {

}

export interface AppState {

}

const strForHRD = new MLString({
  default: "For HRD & HRBP", 
  values: new Map([
      ["en-US", "For HRD & HRBP"],
      ["de", "vermutet"],
      ["fr", "censé"],
      ["es", "supuesto"],
      ["uk", "очікуваний"],
      ["ru", "Повторить"]])
});

const strForPsychologists = new MLString({
  default: "For psychologists", 
  values: new Map([
      ["en-US", "For HRD & HRBP"],
      ["de", "vermutet"],
      ["fr", "censé"],
      ["es", "supuesto"],
      ["uk", "очікуваний"],
      ["ru", "Повторить"]])
});

const strForEveryone = new MLString({
  default: "For everyone", 
  values: new Map([
      ["en-US", "For HRD & HRBP"],
      ["de", "vermutet"],
      ["fr", "censé"],
      ["es", "supuesto"],
      ["uk", "очікуваний"],
      ["ru", "Повторить"]])
});
const desc = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).";

export default class App extends React.Component <AppProps, AppState> {
  render(): React.ReactNode {
    return <div className='app-container'>
      <Logo/>
      <Banner/>
      <span style={{gridArea: 'login'}}>login</span>

      <Market area='HRD' emotion='joy' caption={strForHRD.toString()} description={desc}/>
      <Market area='psychologists' emotion='trust' caption={strForPsychologists.toString()} description={desc}/>
      <Market area='everyone' emotion='surprise' caption={strForEveryone.toString()} description={desc}/>
      <Manifest/>
      <span style={{gridArea: 'q_n_a'}}>Q&A</span>
    </div>
  }
}

