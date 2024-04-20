import { FC, FormEvent, useEffect, useState } from 'react';
import Layout from '../common/layout';
import OverallFeeling from './overallfeeling';
import HappyRange from './happyrange';
import MostImpact from './mostimpact';
import Calendar from './calendar';
import { useMutation, useQuery } from '@apollo/client';
import { getAllMoodLogsQuery } from '../../graphql/queries/MoodLogQueries';
import { getAllMoodLogs, getAllMoodLogsVariables } from '../../graphql/queries/__generated__/getAllMoodLogs';
import { createMoodLog, createMoodLogVariables } from '../../graphql/mutations/__generated__/createMoodLog';
import { createMoodLogMutation } from '../../graphql/mutations/MoodLogMutations';

interface MoodLogProps {
  email: string;
  currentPage: string;
}

interface DailyMoodLogInputFromCalendar {
  email: string;
  logdatetime: string; // Assuming this is a string representation of a date
  overallfeeling: string;
  happinesslevel: number;
  mostimpact: string;
}

const MoodLog: FC<MoodLogProps> = ({ email, currentPage }) => {
  const [moodlogs, setMoodLogs] = useState<any[]>([]);
  const [overallFeeling, setOverallFeeling] = useState('');
  const [happyRangeValue, setHappyRangeValue] = useState(0.5);
  const [mostImpact, setMostImpact] = useState('');

  const { loading: moodLogsLoading, error: moodLogsError, data: moodLogsData } =
    useQuery<getAllMoodLogs, getAllMoodLogsVariables>(
      getAllMoodLogsQuery,
      {
        variables: { email: email },
      }
    );

  const [createMoodLogMutationFn, { loading: mutationLoading, error: mutationError, data: mutationData }] =
    useMutation<createMoodLog, createMoodLogVariables>(
      createMoodLogMutation,
      {
        variables: {
          moodlog: {
            email: email,
            logdatetime: new Date(),
            overallfeeling: overallFeeling,
            happinesslevel: happyRangeValue,
            mostimpact: mostImpact,
          }
        },
      }
    );

  // Load log data received from GraphQL query
  useEffect(() => {
    if (moodLogsData) {
      setMoodLogs(prevMoodLogs => [...prevMoodLogs, moodLogsData]);
      console.log('Mood log data from GQL query: ', moodLogsData);
    }
  }, [moodLogsData]);

  // Handle calendar mood log change
  const updateMoodLog = (updatedMoodLog: DailyMoodLogInputFromCalendar) => {
    const moodLogInput = {
      email: email,
      logdatetime: updatedMoodLog.logdatetime,
      overallfeeling: updatedMoodLog.overallfeeling,
      happinesslevel: updatedMoodLog.happinesslevel,
      mostimpact: updatedMoodLog.mostimpact,
    }
    // TO DO - use gql update function
    console.log("moodLogInput passed from calendar component:", moodLogInput);
  };

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
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const moodLogInput = {
      email: email,
      logdatetime: new Date(),
      overallfeeling: overallFeeling,
      happinesslevel: happyRangeValue,
      mostimpact: mostImpact,
    }
    console.log("Passing mood log input to backend: ", moodLogInput)

    try {
      // Before invoking the mutation function
      console.log("Creating moodlog mutation function is about to be invoked");

      // Invoke the mutation function
      const { data } = await createMoodLogMutationFn();

      // After the mutation function is invoked successfully with response
      if (data && data.createMoodLog) {
        setMoodLogs(prevMoodLogs => [...prevMoodLogs, data.createMoodLog]);
        console.log('Mood log data updated: ', data.createMoodLog);
      }
    } catch (error) {
      console.error("Error occurred while invoking creating moodlog mutation function:", error);
    }
  };

  return (
    <Layout currentPage={currentPage}>
      <Calendar email={email} moodlogs={moodlogs} updateMoodLog={updateMoodLog} />
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
