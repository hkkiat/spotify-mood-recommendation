import Checkbox from './checkbox';
import styles from '../../css/moodlog.module.css'

/*
This component is used to display the question what has the most impact on you today?
*/

function MostImpact() {
    return (
        <div className={styles.checkboxContainer}>
            <label className={`form-label mt-2 ${styles.moodlogquestionheader}`}>What has the most impact on you today?</label>
            <div className={styles.checkboxGroup}>
                <Checkbox id="option1Checkbox" label="Family" value="Family" />
                <Checkbox id="option2Checkbox" label="Friends" value="Friends" />
                <Checkbox id="option3Checkbox" label="Work" value="Work" />
                <Checkbox id="option4Checkbox" label="Life" value="Life" />
                <Checkbox id="option5Checkbox" label="Study" value="Study" />
            </div>
        </div>
    );
}

export default MostImpact;
