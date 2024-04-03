import React, { useState} from 'react';
import './css/App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './components/homepage';
import TicketToRide from './components/TicketToRide';
import MoodLog from './components/moodlog/moodlog';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // Use state to manage currentPage
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
        <Route path='/moodlog' element={<MoodLog currentPage={currentPage} email='example@example.com' />} />
      </Routes>
    </div>
  );
}

export default App;
