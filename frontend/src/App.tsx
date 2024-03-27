import React, { useState} from 'react';
import './css/App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './components/homepage';
import TicketToRide from './components/TicketToRide';
import MoodLog from './components/moodlog';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentPage, setCurrentPage] = useState('');

  // Get current location object using useLocation hook
  const location = useLocation();

  // Update currentPage state based on current pathname found from location object
  React.useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location]);

  return (
    <div>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/ticket' element={<TicketToRide />} />
        <Route path='/moodlog' element={<MoodLog currentPage={currentPage} setCurrentPage={setCurrentPage} />} />
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
