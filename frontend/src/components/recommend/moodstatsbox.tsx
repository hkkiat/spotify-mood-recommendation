import React from 'react';
import styles from '../../css/recommend.module.css'; // Assuming this path is correct

interface MoodStatsBoxProps {
    label: string;
    value: number | null;
    isInteger?: boolean;
    enableHoverEffect?: boolean;  // Controls hover effects
  }
  
const getCategory = (value: number | null) => {
  if (value === null) return { text: "N/A", color: "#FFFFFF" }; // Handle null explicitly
  if (value >= 0 && value < 0.125) return { text: "Very Unhappy", color: '#3B65C4' }; // Red
  if (value >= 0.125 && value < 0.375) return { text: "Unhappy", color: 'lightblue' }; // Orange
  if (value >= 0.375 && value < 0.625) return { text: "Neutral", color: 'lightgrey' }; // Yellow
  if (value >= 0.625 && value < 0.875) return { text: "Happy", color: 'lightgreen' }; // Chartreuse
  if (value >= 0.875 && value <= 1.0) return { text: "Very Happy", color: "#23DC35" }; // Spring Green
  return { color: "#778882" }; // Default color for out of range values
};

const MoodStatsBox: React.FC<MoodStatsBoxProps> = ({ label, value, isInteger = false, enableHoverEffect = true }) => {
    const { text, color } = getCategory(value || 0);
    const displayValue = value !== null ? (isInteger ? Math.round(value) : value.toFixed(2)) : 'N/A';
    const boxClass = enableHoverEffect ? `${styles.moodStatsBox} ${styles.hoverEffect}` : styles.moodStatsBox;
  
    return (
      <div className={boxClass} style={{ backgroundColor: color }}>
        <h3 className={styles.label}>{label}</h3>
        <p className={styles.value}>{displayValue}</p>
        {enableHoverEffect && <p className={styles.description}>{text}</p>}
      </div>
    );
  };
  

export default MoodStatsBox;

// interface MoodStatsBoxProps {
//   label: string;
//   value: number | null;
// }

// const getCategory = (value: number | null) => {
//   if (value === null) return { text: "N/A", color: "#FFFFFF" }; // Handle null explicitly
//   if (value >= 0 && value < 0.125) return { text: "Very Unhappy", color: '#3B65C4' }; // Red
//   if (value >= 0.125 && value < 0.375) return { text: "Unhappy", color: 'lightblue' }; // Orange
//   if (value >= 0.375 && value < 0.625) return { text: "Neutral", color: 'lightgrey' }; // Yellow
//   if (value >= 0.625 && value < 0.875) return { text: "Happy", color: 'lightgreen' }; // Chartreuse
//   if (value >= 0.875 && value <= 1.0) return { text: "Very Happy", color: "#23DC35" }; // Spring Green
//   return { color: "#778882" }; // Default color for out of range values
// };

// const MoodStatsBox: React.FC<MoodStatsBoxProps> = ({ label, value }) => {
//   const { text, color } = getCategory(value);

//   return (
//     <div className={styles.moodStatsBox} style={{ backgroundColor: color }}>
//       <h3 className={styles.label}>{label}</h3>
//       <p className={styles.value}>{value !== null ? value.toFixed(2) : 'N/A'}</p>
//       {/* <p className={styles.description}>{text}</p> */}
//     </div>
//   );
// };

// export default MoodStatsBox;
