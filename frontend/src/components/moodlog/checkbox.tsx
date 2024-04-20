import React, { FC } from 'react';

/*
This component is used to display the individual checkbox
*/
interface CheckboxProps {
    id: string;
    label: string;
    value: string;
    checked: boolean;
    onChange: (checked: boolean, value: string) => void;
    onMostImpactChange: (value: string) => void;
}

const Checkbox: FC<CheckboxProps> = ({ id, label, value, checked, onChange, onMostImpactChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        onChange(isChecked, value); // Call the onChange function with the checked status and value of the checkbox
        if (isChecked) {
            onMostImpactChange(value); // Call the onMostImpactChange function with the value of the checkbox if it's checked
        }
    };

    return (
        <div className="form-check">
            <input className="form-check-input" type="checkbox" value={value} id={id} checked={checked} onChange={handleChange}/>
            <label className="form-check-label" htmlFor={id}>
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
