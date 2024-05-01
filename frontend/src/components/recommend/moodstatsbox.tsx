import React from 'react';
import styles from '../../css/recommend.module.css'

interface MoodStatsBoxProps {
  label: string;
  value: number | null;  // Assuming value can be a number or null if not available
}

const MoodStatsBox: React.FC<MoodStatsBoxProps> = ({ label, value }) => (
    <div className="mood-stats-box">
      <div className="label">{label}</div>
      <div className="value">{value !== null ? value.toFixed(2) : 'N/A'}</div>
    </div>
  );  

export default MoodStatsBox;
