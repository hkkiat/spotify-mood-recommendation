import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import NavItem from './navitem';
import { BiHome, BiLogOut, BiChart, BiCommand, BiSearch } from 'react-icons/bi';
import { logout } from '../../graphql/mutations/SessionControl';
import { Logout } from '../../graphql/mutations/__generated__/Logout';
import { useNavigate } from 'react-router-dom';
import styles from '../../css/recommend.module.css';
import { ReactComponent as Logo } from '../../images/music-note-list.svg';
import { useLocation } from 'react-router-dom';

function NavBar() {
    const [currentPage, setCurrentPage] = useState('/home');
    const navigate = useNavigate();
    const location = useLocation();

    const [logoutUser] = useMutation<Logout>(logout, {
        onCompleted: () => {
            setCurrentPage('/');
            navigate('/'); // Assuming you have a route set up to handle '/logout'
        }
    });
    
    // Determine if the current page is the sign in page
    const isSignInPage = location.pathname === '/'; // Adjust '/signin' as per your route setup

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarLogo}>
                <Logo width="30" height="30" />
                <span className={styles.appName}>MoodTracker</span>
            </div>
            <ul className={styles.navLinks}>
                <NavItem linkText="Mood Log" active={currentPage === '/moodlog'} onClick={() => setCurrentPage('/moodlog')} />
                <NavItem linkText="Recommend" active={currentPage === '/recommend'} onClick={() => setCurrentPage('/recommend')} />
            </ul>
            {isSignInPage ? (
                <div className={styles.hiddenPlaceholder}></div> // Placeholder when logout is not shown
            ) : (
                <button onClick={() => logoutUser()} className={styles.signInBtn}>
                    <span>Log Out</span>
                </button>
            )}
        </nav>
    );
}

export default NavBar;
