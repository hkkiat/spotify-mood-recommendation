import React, { useState } from 'react';
import Checkbox from './checkbox';
import styles from '../../css/moodlog.module.css'

interface MostImpactProps {
    onMostImpactChange: (value: string) => void;
}

const MostImpact: React.FC<MostImpactProps> = ({ onMostImpactChange }) => {
    const [mostImpact, setMostImpact] = useState('');

    const handleMostImpactChange = (value: string) => {
        setMostImpact(value);
        onMostImpactChange(value);
    };

    return (
        <div className={styles.checkboxContainer}>
            <label className={`form-label mt-2 ${styles.moodlogquestionheader}`}>What has the most impact on you today?</label>
            <div className={styles.checkboxGroup}>
                <Checkbox id="option1Checkbox" label="Family" value="Family" checked={mostImpact === 'Family'} onChange={(checked, value) => handleMostImpactChange(checked ? value : '')} onMostImpactChange={handleMostImpactChange} />
                <Checkbox id="option2Checkbox" label="Friends" value="Friends" checked={mostImpact === 'Friends'} onChange={(checked, value) => handleMostImpactChange(checked ? value : '')} onMostImpactChange={handleMostImpactChange} />
                <Checkbox id="option3Checkbox" label="Work" value="Work" checked={mostImpact === 'Work'} onChange={(checked, value) => handleMostImpactChange(checked ? value : '')} onMostImpactChange={handleMostImpactChange} />
                <Checkbox id="option4Checkbox" label="Life" value="Life" checked={mostImpact === 'Life'} onChange={(checked, value) => handleMostImpactChange(checked ? value : '')} onMostImpactChange={handleMostImpactChange} />
                <Checkbox id="option5Checkbox" label="Study" value="Study" checked={mostImpact === 'Study'} onChange={(checked, value) => handleMostImpactChange(checked ? value : '')} onMostImpactChange={handleMostImpactChange} />
            </div>
        </div>
    );
};

export default MostImpact;
