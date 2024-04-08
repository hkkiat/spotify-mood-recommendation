import React, { FC, FormEvent, useState, useEffect } from 'react';
import Layout from '../common/layout';
import OverallFeeling from './overallfeeling';
import HappyRange from './happyrange';
import MostImpact from './mostimpact';
import Calendar from './calendar';
import { useQuery } from '@apollo/client';
import { getAllMoodLogsQuery } from '../../graphql/queries/MoodLogQueries';
import { getAllMoodLogs, getAllMoodLogsVariables } from '../../graphql/queries/__generated__/getAllMoodLogs';

interface MoodLogProps {
  email: string;
  currentPage: string;
}

// Custom hook to fetch mood logs
const useMoodLogs = (email: string) => {
  const { loading, error, data } = useQuery<getAllMoodLogs, getAllMoodLogsVariables>(
    getAllMoodLogsQuery,
    {
      variables: { email: email },
    }
  );

  return { loading, error, data };
};

const MoodLog: FC<MoodLogProps> = ({ email, currentPage }) => {
  const [overallFeeling, setOverallFeeling] = useState('');
  const [happyRangeValue, setHappyRangeValue] = useState(0.5);
  const [mostImpact, setMostImpact] = useState('');

  const { loading, error, data } = useMoodLogs(email);

  // Handle loading state
  if (loading) return <p>Loading...</p>;

  // Handle error state
  if (error) return <p>Error: {error.message}</p>;

  // Log data received from GraphQL query
  console.log('Mood log data: ', data);

  // Handle text change
  const handleOverallFeelingChange = (text: string) => {
    setOverallFeeling(text);
  };

  // handle range change
  const handleHappyRangeChange = (value: number) => {
    setHappyRangeValue(value); // Update the happy range value in the state
  };

  // handle most impact change
  const handleMostImpactChange = (text: string) => {
    setMostImpact(text); // Update the happy range value in the state
  };

  // handle submit
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Perform actions with the submitted data, such as executing the GraphQL query
    console.log('Overall feeling submitted:', overallFeeling);
    console.log("Happy range submitted:", happyRangeValue);
    console.log("Most impact value submitted:", mostImpact);
  };

  return (
    <Layout currentPage={currentPage}>
      <Calendar />
      <OverallFeeling onOverallFeelingChange={handleOverallFeelingChange} />
      <HappyRange onHappyRangeChange={handleHappyRangeChange} />
      <MostImpact onMostImpactChange={handleMostImpactChange} />
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-primary mb-2" onClick={handleSubmit}>Log my mood in!</button>
      </div>
    </Layout>
  );
}

export default MoodLog;
