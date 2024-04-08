import React, { useState } from 'react';
import styles from '../../css/moodlog.module.css'


/*
This component is used to display the happy range bar
*/

interface HappyRangeProps {
    onHappyRangeChange: (value: number) => void; // Function prop to handle happy range value change
}

function HappyRange({ onHappyRangeChange }: HappyRangeProps) {
    // State to track the value of the range input
    const [rangeValue, setRangeValue] = useState(0.5);

    // Mapping between numerical values and their corresponding text descriptions
    const valueTextMap: Record<number, string> = {
        0: 'Very Unhappy',
        0.25: 'Unhappy',
        0.5: 'Neutral',
        0.75: 'Happy',
        1: 'Very Happy'
    };

    // Function to handle changes in the range input value
    const handleRangeChange = (event: { target: { value: string; }; }) => {
        const value = parseFloat(event.target.value);
        setRangeValue(value); // Update the rangeValue state with the new value
        onHappyRangeChange(value); // back to parent
    };

    return (
        <div >

            <label htmlFor="happyRange" className={`form-label mt-2 ${styles.moodlogquestionheader}`}>Happiness level?</label>
            <div className="range" data-mdb-range-init>
                <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="1"
                    step="0.25"
                    id="happyRange"
                    value={rangeValue} // Bind the value of the input to the rangeValue state
                    onChange={handleRangeChange} // Call handleRangeChange function when the input value changes
                />
                <div className='rangeLabels' style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span >{valueTextMap[0]}</span>
                    <span >{valueTextMap[0.25]}</span>
                    <span >{valueTextMap[0.5]}</span>
                    <span >{valueTextMap[0.75]}</span>
                    <span >{valueTextMap[1]}</span>
                </div>
            </div>
            <p>Selected feeling: {valueTextMap[rangeValue]}</p> {/* Display the text corresponding to the selected feeling */}
            <p>Selected value: {rangeValue}</p> {/* Display the text corresponding to the selected value */}
        </div>
    );
}

export default HappyRange;
