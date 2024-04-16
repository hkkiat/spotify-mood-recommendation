import React from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

interface HappyRangeSliderProps {
    onHappyRangeChange: (value: number) => void; // Function prop to handle temperature value change
}

function HappyRangeSlider({ onHappyRangeChange: onHappyRangeChange }: HappyRangeSliderProps) {
    const marks = [
        {
            value: 0,
            label: 'Very Unhappy',
        },
        {
            value: 0.25,
            label: 'Unhappy',
        },
        {
            value: 0.5,
            label: 'Neutral',
        },
        {
            value: 0.75,
            label: 'Happy',
        },
        {
            value: 1,
            label: 'Very Happy',
        }
    ];

    const handleSliderChange = (event: Event, value: number | number[]) => {
        onHappyRangeChange(value as number); // Pass the new temperature value to the parent component
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Slider
                aria-label="happinessRangeSlider"
                defaultValue={0.5}
                valueLabelDisplay="auto"
                step={0.25}
                marks={marks}
                min={0}
                max={1}
                onChange={handleSliderChange}
                sx={{ width: '75%' }} // Adjust width as needed
            />
        </div>

    );
}

export default HappyRangeSlider;
