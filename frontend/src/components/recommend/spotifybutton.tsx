import React from 'react';
import styles from '../../css/recommend.module.css'; // Make sure to import your CSS file

interface SpotifyButtonProps {
  onClick: () => void;
  buttonText: string;
}

const SpotifyButton: React.FC<SpotifyButtonProps> = ({ onClick, buttonText }) => {
  return (
    <button className={styles.spotifyButton} onClick={onClick}>
      {buttonText}
    </button>
  );
};

export default SpotifyButton;
