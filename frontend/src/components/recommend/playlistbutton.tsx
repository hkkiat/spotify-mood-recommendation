// PlaylistButton.tsx

import React from 'react';
import styles from '../../css/recommend.module.css';
interface PlaylistButtonProps {
  imageUrl: string;
  label: string;
  number: string | number | null;  // Can accept both string and number types
}

const PlaylistButton: React.FC<PlaylistButtonProps> = ({ imageUrl, label, number }) => {
    const displayNumber = number !== undefined && number !== null ? number : "N/A";

    return (
        <div className={styles.playlistButton} onClick={() => console.log(`Navigating to ${label}`)}>
            <img src={imageUrl} alt={label} className={styles.image} />
            <div className={styles.playlistLabel}>{label}</div>
            <div className={styles.playlistNumber}>{displayNumber}</div>
        </div>
    );
}


export default PlaylistButton;
