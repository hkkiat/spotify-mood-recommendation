import Slider from '@mui/material/Slider';

interface HappyRangeSliderProps {
    happinessLevel: number;
    onHappyRangeChange: (value: number) => void; // Function prop to handle temperature value change
}

function HappyRangeSlider({ happinessLevel, onHappyRangeChange: onHappyRangeChange }: HappyRangeSliderProps) {
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

    const adjustedHappinessLevel = happinessLevel === -1 ? 0.5 : happinessLevel;

    const handleSliderChange = (event: Event, value: number | number[]) => {
        onHappyRangeChange(value as number); 
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Slider
                aria-label="happinessRangeSlider"
                value={adjustedHappinessLevel}
                valueLabelDisplay="auto"
                step={0.25}
                marks={marks}
                min={0}
                max={1}
                onChange={handleSliderChange}
                sx={{ width: '75%' }}
            />
        </div>

    );
}

export default HappyRangeSlider;
