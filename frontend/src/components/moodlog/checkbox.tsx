/*
This component is used to display the individual checkbox
*/

interface CheckboxProps {
    id: string;
    label: string;
    value: string;
}

function Checkbox({ id, label, value }: CheckboxProps) {
    return (
        <div className="form-check">
            <input className="form-check-input" type="checkbox" value={value} id={id} />
            <label className="form-check-label" htmlFor={id}>
                {label}
            </label>
        </div>
    );
}

export default Checkbox;
