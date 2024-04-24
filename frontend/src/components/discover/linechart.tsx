import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { FC, useEffect, useState } from 'react';

interface LineChartProps {
    moodlogs: any[]; // Assuming moodlogs is an array of mood log data
    // updateMoodLog: (updatedMoodLog: any) => void;
}

interface DailyMoodLog {
    __typename: string;
    _id: string;
    email: string;
    logdatetime: string; // Assuming this is a string representation of a date
    overallfeeling: string;
    happinesslevel: number;
    mostimpact: string;
}

const BasicLineChart: FC<LineChartProps> = ({ moodlogs }) => {
    const [moodlogsData, setMoodlogsData] = useState<DailyMoodLog[]>([]);

    useEffect(() => {
        if (moodlogs.length !== 0) {
            setMoodlogsData(moodlogs[0]?.getAllMoodLogs);
            console.log("Just setup moodlogsData for line chart", moodlogs);
        }
    }, [moodlogs]);

    const xAxisData = moodlogsData.map((log) => log.logdatetime); // Change to getDate() if you want the day of the month
    const seriesData = moodlogsData.map((log) => log.happinesslevel);

    console.log('this is the date data', xAxisData);
    console.log("this is the happiness level", seriesData);

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <SparkLineChart
                    data={seriesData}
                    height={100}
                    curve="natural"
                    area
                    showHighlight
                    showTooltip
                    xAxis={{
                        data: xAxisData,
                        valueFormatter: (value) => value.toString().slice(0, 10),
                      }}
                />
            </Box>
        </div>

    );
}



export default BasicLineChart;
