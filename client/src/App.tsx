import React from 'react';
import './App.css';
import TGLogin from './components/tgLogin';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <TGLogin tg_user_id='' auth_code=''/>
      </header>
    </div>
  );
}

export default App;
