import React from 'react';
import './css/App.css';
import { Route, Routes } from 'react-router-dom';
import HomePage from './components/homepage';
function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
      </Routes>
    </div>
    //<div className='App'>
    //  <header className='App-header'>
    //    <img src={logo} className='App-logo' alt='logo' />
    //    <p>
    //      Edit <code>src/App.tsx</code> and save to reload.
    //    </p>
    //    <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>
    //      Learn React
    //    </a>
    //  </header>
    //</div>
  );
}

export default App;
