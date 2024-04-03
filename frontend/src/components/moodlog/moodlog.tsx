import { FC, FormEvent, useState } from 'react';
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
const allMoodLogs = (email: string) => {
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
  const { loading, error, data } = allMoodLogs(email);

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

  // handle submit
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Perform actions with the submitted data, such as executing the GraphQL query
    console.log('Overall feeling submitted:', overallFeeling);
  };

  return (
    <Layout currentPage={currentPage}>
      <Calendar />
      <OverallFeeling onOverallFeelingChange={handleOverallFeelingChange} />
      <HappyRange />
      <MostImpact />
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>Submit Overall Feeling</button>
      </div>
    </Layout>
  );
}

export default MoodLog;
