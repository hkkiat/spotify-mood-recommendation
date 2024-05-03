import React from 'react';
import styles from '../../css/recommend.module.css';
import { ReactComponent as Logo } from '../../images/music-note-list.svg'; // Import SVG as a component


function Navbar() {
    return (
      <nav className={styles.navbar}>
        <div className={styles.navbarLogo}>
          <Logo width="30" height="30" /> {/* Use SVG as component */}
          <span className={styles.appName}>MoodTracker</span> {/* Add the app name here */}
        </div>
        <ul className={styles.navLinks}>
          <li><a href="/">Home</a></li>
          <li><a href="/moodlog">Mood Log</a></li>
          <li><a href="/recommend2">Playlist </a></li>
        </ul>
        <button className={styles.signInBtn}>Sign In</button>
      </nav>
    );
  }

export default Navbar;
