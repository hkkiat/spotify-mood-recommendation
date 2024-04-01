import styles from '../../css/moodlog.module.css'

/*
This component is used to display the overall feeling open-ended questionnaire
*/

function OverallFeeling() {

    return (
        <div>
            <label className={`form-label mt-2 ${styles.moodlogquestionheader}`} htmlFor="textAreaExample1">How do I feel today?</label>
            <textarea className="form-control " id="textAreaExample1" rows={4}></textarea>

        </div>
    );
}

export default OverallFeeling;
