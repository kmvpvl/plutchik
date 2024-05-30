import React from 'react';
import './App.css';
import Logo from './components/logo/logo';
import Banner from './components/banner/banner';
import Market from './components/market/market';
import MLString from './mlstrings';

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

export default class App extends React.Component <AppProps, AppState> {
  render(): React.ReactNode {
    return <div className='app-container'>
      <Logo/>
      <Banner/>
      <span style={{gridArea: 'login'}}>login</span>

      <Market area='HRD' emotion='joy' caption={strForHRD.toString()} description=''/>
      <Market area='psychologists' emotion='trust' caption={strForPsychologists.toString()} description=''/>
      <Market area='everyone' emotion='surprise' caption={strForEveryone.toString()} description=''/>
      <span style={{gridArea: 'safety_manifest'}}>safety_manifest</span>
      <span style={{gridArea: 'q_n_a'}}>Q&A</span>
    </div>
  }
}

