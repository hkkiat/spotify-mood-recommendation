import { useState, useEffect } from 'react';
import './css/App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import MoodLog from './components/moodlog/moodlog';
import Recommendation from './components/recommend/recommend';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/session/LoginPage';
import RegisterPage from './components/session/RegisterPage';
import { ApolloProvider } from '@apollo/react-hooks';
import { defaultClient } from './Client';

function App() {
  // Use state to manage currentPage
  const [currentPage, setCurrentPage] = useState('');

  // Get current location object using useLocation hook
  const location = useLocation();

  // Update currentPage state based on current pathname found from location object
  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location]);

  return (
    <div>
      <ApolloProvider client={defaultClient}>
        <div>
          <Routes >
            <Route path={'/'} element={<Login  currentPage={currentPage} />}/>
            <Route path={'register'} element={<RegisterPage currentPage={currentPage}/>} />
            <Route path='/moodlog' element={<MoodLog currentPage={currentPage} email='example@example.com' />} />
            <Route path='/recommend' element={<Recommendation currentPage={currentPage} email='example@example.com' />} />
          </Routes>
        </div>
      </ApolloProvider>
    </div>
  );
}

export default App;
