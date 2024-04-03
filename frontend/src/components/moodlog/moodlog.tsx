import React from 'react';
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
  currentPage: string; // Add currentPage prop
}

const MoodLog: React.FC<MoodLogProps> = ({ email, currentPage }) => {
  console.log('This is the email', email)
  // Fetch mood logs data
  const { loading, error, data } = useQuery<getAllMoodLogs, getAllMoodLogsVariables>(
    getAllMoodLogsQuery,
    {
      variables: { email: email },
    }
  );

  // Handle loading state
  if (loading) return <p>Loading...</p>;

  // Handle error state
  if (error) return <p>Error: {error.message}</p>;

  // Log data received from GraphQL query
  console.log('Mood log data:', data);

  return (
    <Layout currentPage={currentPage}> {/* Pass currentPage to Layout */}
      {/* Render components */}
      <Calendar />
      <OverallFeeling />
      <HappyRange />
      <MostImpact />
    </Layout>
  );
}

export default MoodLog;
