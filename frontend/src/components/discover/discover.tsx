import { FC, useEffect, useState } from "react";
import Layout from "../common/layout";
import BasicLineChart from "./linechart";
import { useQuery } from "@apollo/client";
import { getAllMoodLogsQuery } from "../../graphql/queries/MoodLogQueries";
import { getAllMoodLogs, getAllMoodLogsVariables } from "../../graphql/queries/__generated__/getAllMoodLogs";

interface DiscoverProps {
    email: string;
    currentPage: string;
}

const Discover: FC<DiscoverProps> = ({ email, currentPage }) => {
    const [moodlogs, setMoodLogs] = useState<any[]>([]);
    
    const { loading: moodLogsLoading, error: moodLogsError, data: moodLogsData } =
    useQuery<getAllMoodLogs, getAllMoodLogsVariables>(
        getAllMoodLogsQuery,
        {
            variables: { email: email },
        }
    );

    useEffect(() => {
        if (moodLogsData) {
          setMoodLogs(prevMoodLogs => [...prevMoodLogs, moodLogsData]);
          console.log('Mood log data from GQL query: ', moodLogsData);
          console.log('Mood log data in Discover component: ', moodlogs);
        }
      }, [moodLogsData]);

    return (
        <Layout currentPage={currentPage}>
            <BasicLineChart moodlogs={moodlogs}></BasicLineChart>
        </Layout>
    )
}

export default Discover;