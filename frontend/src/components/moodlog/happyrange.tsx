import React, { useState } from 'react';
import styles from '../../css/moodlog.module.css'


/*
This component is used to display the overall feeling open-ended questionnaire
*/

function HappyRange() {
    // State to track the value of the range input
    const [rangeValue, setRangeValue] = useState(2);

    // Mapping between numerical values and their corresponding text descriptions
    const valueTextMap: Record<number, string> = {
        0: 'Very Unhappy',
        1: 'Unhappy',
        2: 'Neutral',
        3: 'Happy',
        4: 'Very Happy'
    };

    // Function to handle changes in the range input value
    const handleRangeChange = (event: { target: { value: string; }; }) => {
        setRangeValue(parseFloat(event.target.value)); // Update the rangeValue state with the new value
    };

    return (
        <div >
            
            <label htmlFor="customRange3" className={`form-label mt-2 ${styles.moodlogquestionheader}`}>Happiness level?</label>
            <div className="range" data-mdb-range-init>
                <input 
                    type="range" 
                    className="form-range" 
                    min="0" 
                    max="4" 
                    step="1" 
                    id="customRange3" 
                    value={rangeValue} // Bind the value of the input to the rangeValue state
                    onChange={handleRangeChange} // Call handleRangeChange function when the input value changes
                />
            </div>
            <p>Selected value: {valueTextMap[rangeValue]}</p> {/* Display the text corresponding to the selected value */}
        </div>
    );
}

export default HappyRange;
