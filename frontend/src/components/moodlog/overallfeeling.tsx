import React, { FC, ChangeEvent, useState } from 'react';
import styles from '../../css/moodlog.module.css';

interface OverallFeelingProps {
    onOverallFeelingChange: (text: string) => void;
}

const OverallFeeling: FC<OverallFeelingProps> = ({ onOverallFeelingChange }) => {
    const [feelingText, setFeelingText] = useState('');

    const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setFeelingText(newValue);
        onOverallFeelingChange(newValue); // Call the function passed from parent
    };

    return (
        <div>
            <label className={`form-label mt-2 ${styles.moodlogquestionheader}`} htmlFor="textAreaExample1">How do you feel today?</label>
            <textarea
                className="form-control"
                placeholder="Log your feelings and thoughts today"
                id="textAreaExample1"
                rows={4}
                value={feelingText}
                onChange={handleTextareaChange}
            ></textarea>
        </div>
    );
}

export default OverallFeeling;
