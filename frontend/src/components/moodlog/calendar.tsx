import { useEffect, useRef, useState, ChangeEvent, FC } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-sg';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { BiHome } from 'react-icons/bi'; // Import icons


const CURRENT_DATE = dayjs(); // current date

type Mood = 'happy' | 'sad' | 'neutral';

interface DayData {
    mood: Mood;
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

interface CalendarProps {
    moodlogs: any[]; // Assuming moodlogs is an array of mood log data
}

function generateMonthArray(date: Dayjs, moodlogsDataCalendar: DailyMoodLog[], { signal }: { signal: AbortSignal }) {
    return new Promise<{ daysToHighlight: number[]; outputMoodlogsData: DailyMoodLog[] }>((resolve, reject) => {
        console.log('Incorporating...', moodlogsDataCalendar)
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            const targetMonth = date.month()
            const targetYear = date.year()
            const daysToHighlight: number[] = []; // not used - KIV in case we want to highlight certain days
            const outputMoodlogsData: DailyMoodLog[] = [];

            console.log('targetmonth', targetMonth)
            for (let i = 1; i <= daysInMonth; i++) {
                const matchingItem = moodlogsDataCalendar.find(
                    (item) =>
                        new Date(item.logdatetime).getDate() === i &&
                        new Date(item.logdatetime).getMonth() === targetMonth &&
                        new Date(item.logdatetime).getFullYear() === targetYear
                );

                if (matchingItem) {
                    // If data exists, add it to the outputMoodlogsData array
                    console.log('It matches!')
                    outputMoodlogsData.push(matchingItem);
                } else {
                    // If no existing data, generate random mood data for this day
                    outputMoodlogsData.push({
                        __typename: 'MoodLog',
                        _id: "generated", // Assuming a function to generate ObjectId
                        email: 'example@example.com',
                        logdatetime: date.set('date', i).toISOString(), // Set the date and convert to ISOString
                        overallfeeling: '', // Randomly select overall feeling
                        happinesslevel: -1, // Random happiness level
                        mostimpact: '' // Assuming a default value for mostimpact
                    });
                }
            }
            console.log('outputMoodlogsData: ', outputMoodlogsData)
            console.log('daysToHighlight: ', daysToHighlight)
            resolve({ daysToHighlight, outputMoodlogsData });
        }, 500);

        signal.onabort = () => {
            clearTimeout(timeout);
            reject(new DOMException('aborted', 'AbortError'));
        };
    });
}

function DayComponent(props: PickersDayProps<Dayjs> & {
    highlightedDays?: number[];
    moodData: DayData[];
    updateMoodData: (updatedMoodData: DayData[]) => void;
    moodlogsDataCalendar: DailyMoodLog[];
    updateMoodlogsData: (updateMoodlogsData: DailyMoodLog[]) => void;
}) {
    const { highlightedDays = [], moodData, day, outsideCurrentMonth, updateMoodData, moodlogsDataCalendar, updateMoodlogsData, ...other } = props;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

    const isCurrentDate = dayjs().isSame(day, 'day'); // Check if the day is the current date to determine if icon should be displayed

    // console.log('This is inside DayComponent, moodData:', moodData)
    console.log('This is inside DayComponent, moodlogsDataCalendar:', moodlogsDataCalendar)

    const happinessLevel = moodlogsDataCalendar[props.day.date() - 1]?.happinesslevel || 0; // Adjust index to match day
    const colorMap: Record<string, string> = {
        '1': 'lightgreen',
        '0.75': 'lightyellow',
        '0.5': 'lightpink',
        '0.25': 'lightorange',
        '0': 'red',
        '-1': 'grey',
    };
    const backgroundColor = colorMap[happinessLevel] || 'lightpink';
    // console.log('This is inside DayComponent, mood:', mood)
    // console.log('This is inside DayComponent, day:', day)

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedMood(null); // Reset selected mood
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleMoodChange = (newMood: Mood) => {
        setSelectedMood(newMood);
        setOpen(false); // Close the dialog after selecting mood

        // Update moodData state with the new mood for the selected day
        const updatedMoodData = [...moodData];
        updatedMoodData[props.day.date() - 1] = { mood: newMood };
        updateMoodData(updatedMoodData);
    };

    return (
        <>
            {isCurrentDate && (
                <Badge
                    key={props.day.toString()}
                    overlap="circular"
                    badgeContent={<BiHome />}
                    color={'success'}
                    onClick={handleClick}
                >
                    <PickersDay
                        {...other}
                        outsideCurrentMonth={outsideCurrentMonth}
                        day={day}
                        sx={{ backgroundColor }}
                        onClick={handleClick} // Keep onClick for current dates
                    />
                </Badge>
            )}
            {!isCurrentDate && (
                <PickersDay
                    {...other}
                    outsideCurrentMonth={outsideCurrentMonth}
                    day={day}
                    sx={{ backgroundColor }}
                    onClick={handleClick} // Keep onClick for non-current dates
                />
            )}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{`Enter data for ${day.format('DD/MM/YYYY')}`}</DialogTitle>
                <TextField
                    autoFocus
                    margin="dense"
                    id="data"
                    label="Data"
                    type="text"
                    fullWidth
                    value={inputValue}
                    onChange={handleChange}
                />
                <div>
                    <button onClick={() => handleMoodChange('happy')}>Happy</button>
                    <button onClick={() => handleMoodChange('sad')}>Sad</button>
                    <button onClick={() => handleMoodChange('neutral')}>Neutral</button>
                </div>
            </Dialog>
        </>
    );
}


const Calendar: FC<CalendarProps> = ({ moodlogs }) => {
    const requestAbortController = useRef<AbortController | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
    const [moodData, setMoodData] = useState<DayData[]>([]);
    const [moodlogsData, setMoodlogsData] = useState<DailyMoodLog[]>(moodlogs[0]?.getAllMoodLogs || []); // this depends on prop data
    const [moodlogsDataCalendar, setMoodlogsDataCalendar] = useState<DailyMoodLog[]>([]); // this depends on month selected
    const [dataReady, setDataReady] = useState(false);

    // Initialize prop data into moodlogsData & moodlogsDataCalendar
    useEffect(() => {
        if (moodlogs.length !== 0) {
            console.log("Initializing moodlogsData state with:", moodlogs[0].getAllMoodLogs);
            setMoodlogsData(moodlogs[0].getAllMoodLogs);
            setMoodlogsDataCalendar(moodlogs[0].getAllMoodLogs);
        }
    }, [moodlogs]);

    // Initialize current month's array based on today's date & moodlogsDataCalendar 
    useEffect(() => {
        if (moodlogsDataCalendar.length > 0) {
            console.log("This is CURRENT_DATE before generating:", CURRENT_DATE);
            console.log("This is moodlogsDataCalendar state before generating:", moodlogsDataCalendar);
            prepareCalendarArray(CURRENT_DATE, moodlogsDataCalendar);
        }
    }, []);

    /*
    LOGGING STATEMENTS
    */
    useEffect(() => {
        if (moodlogsData.length > 0) {
            console.log("moodlogsData updated:", moodlogsData); // Log moodlogsData after it's updated
        }
    }, [moodlogsData]);

    useEffect(() => {
        if (moodlogsDataCalendar.length > 0) {
            console.log("moodlogsDataCalendar updated:", moodlogsDataCalendar); // Log moodlogsDataCalendar after it's updated
        }
    }, [moodlogsDataCalendar]);

    /*
    HELPER FUNCTIONS
    */

    const handleDataReady = () => {
        setDataReady(true);
    };

    const prepareCalendarArray = (date: Dayjs, moodlogsDataCalendar: DailyMoodLog[]) => {
        console.log('Generating calendar array...', moodlogsDataCalendar)
        const controller = new AbortController();
        if (moodlogsDataCalendar.length !== 0) {
            generateMonthArray(date, moodlogsDataCalendar, {
                signal: controller.signal,
            })
                .then(({ daysToHighlight, outputMoodlogsData }) => {
                    setHighlightedDays(daysToHighlight); // not used - kiv if want to use
                    setMoodlogsDataCalendar(outputMoodlogsData);
                    setIsLoading(false);
                    handleDataReady();
                })
                .catch((error) => {
                    // ignore the error if it's caused by `controller.abort`
                    if (error.name !== 'AbortError') {
                        throw error;
                    }
                });

            requestAbortController.current = controller;
        }

    };

    useEffect(() => {
        prepareCalendarArray(CURRENT_DATE, moodlogsData);
        // abort request on unmount
        return () => requestAbortController.current?.abort();
    }, []);

    const handleMonthChange2 = (date: Dayjs) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        setIsLoading(true);
        setHighlightedDays([]);
        setMoodlogsDataCalendar(moodlogs[0].getAllMoodLogs); // reload all moodlogs
        prepareCalendarArray(date, moodlogsData);
    };

    const updateMoodData = (updatedMoodData: DayData[]) => {
        setMoodData(updatedMoodData);
    };

    const updateMoodlogsData = (updatedMoodlogsData: DailyMoodLog[]) => {
        setMoodlogsData(updatedMoodlogsData);
    };
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
            <DateCalendar
                defaultValue={CURRENT_DATE}
                loading={isLoading}
                onMonthChange={handleMonthChange2}
                renderLoading={() => <DayCalendarSkeleton />}
                slots={{
                    day: (props) => dataReady ? <DayComponent {...props} moodData={moodData} updateMoodData={updateMoodData} moodlogsDataCalendar={moodlogsDataCalendar} updateMoodlogsData={updateMoodlogsData} /> : null,
                }}
                slotProps={{
                    day: {
                        highlightedDays,
                    } as any,
                }}
            />
        </LocalizationProvider>
    );
}

export default Calendar;