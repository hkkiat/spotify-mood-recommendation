import { useEffect, useRef, useState, ChangeEvent, FC } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en-sg';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputLabel from '@mui/material/InputLabel';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { BiHome } from 'react-icons/bi'; // Import icons
import { MdOutlineFamilyRestroom, MdWork, MdNightlife } from "react-icons/md";
import { GiThreeFriends } from "react-icons/gi";
import { PiStudentFill } from "react-icons/pi";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import styles from '../../css/moodlog.module.css'
import HappyRangeSlider from './happyrangeslider';


const CURRENT_DATE = dayjs(); // current date

type Happiness = 'very happy' | 'happy' | 'neutral' | 'unhappy' | 'very unhappy'

const happinessValueMap: Record<Happiness, number> = {
    'very happy': 1,
    'happy': 0.75,
    'neutral': 0.5,
    'unhappy': 0.25,
    'very unhappy': 0,
};

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
    email: string;
    moodlogs: any[]; // Assuming moodlogs is an array of mood log data
    updateMoodLog: (updatedMoodLog: any) => void;
}

function generateMonthArray(email: string, date: Dayjs, moodlogsModifiedDataForCalendar: DailyMoodLog[], { signal }: { signal: AbortSignal }) {
    return new Promise<{ daysToHighlight: number[]; outputMoodlogsData: DailyMoodLog[] }>((resolve, reject) => {
        console.log('Incorporating moodlog array from DB...', moodlogsModifiedDataForCalendar)
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            const targetMonth = date.month()
            const targetYear = date.year()
            const daysToHighlight: number[] = []; // not used - KIV in case we want to highlight certain days
            const outputMoodlogsData: DailyMoodLog[] = [];

            for (let i = 1; i <= daysInMonth; i++) {
                const matchingItem = moodlogsModifiedDataForCalendar.find(
                    (item) =>
                        new Date(item.logdatetime).getDate() === i &&
                        new Date(item.logdatetime).getMonth() === targetMonth &&
                        new Date(item.logdatetime).getFullYear() === targetYear
                );

                if (matchingItem) {
                    // If data exists, add it to the outputMoodlogsData array
                    console.log('Moodlog entry found in DB: ', matchingItem)
                    outputMoodlogsData.push(matchingItem);
                } else {
                    // If no existing data, generate random mood data for this day
                    outputMoodlogsData.push({
                        __typename: 'MoodLog',
                        _id: "generated", // Assuming a function to generate ObjectId
                        email: email,
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
    email: string;
    highlightedDays?: number[];
    moodlogsModifiedDataForCalendar: DailyMoodLog[];
    setMoodlogsModifiedDataForCalendar: (moodlogsModifiedDataForCalendar: DailyMoodLog[]) => void;
    updateMoodLog: (updatedMoodLog: any) => void;
}) {
    const { email, highlightedDays = [], day, outsideCurrentMonth, moodlogsModifiedDataForCalendar, setMoodlogsModifiedDataForCalendar, updateMoodLog, ...other } = props;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [happiness, setHappiness] = useState('');
    const [happyRangeValue, setHappyRangeValue] = useState(0.5);
    const [tempRangeValue, setHappyTempValue] = useState(0.5);

    const isCurrentDate = dayjs().isSame(day, 'day'); // Check if the day is the current date to determine if icon should be displayed

    console.log('This is inside DayComponent, moodlogsModifiedDataForCalendar:', moodlogsModifiedDataForCalendar)

    const happinessLevel = moodlogsModifiedDataForCalendar[props.day.date() - 1]?.happinesslevel || 0; // Adjust index to match day
    const colorMap: Record<string, string> = {
        '1': 'lightgreen',
        '0.75': 'lightyellow',
        '0.5': 'lightpink',
        '0.25': 'lightorange',
        '0': 'red',
    };
    const backgroundColor = colorMap[happinessLevel] || 'grey';

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleMostImpactDropdownChange = (event: SelectChangeEvent) => {
        setHappiness(event.target.value as string);
    };

    const handleHappyRangeChange = (value: number) => {
        setHappyRangeValue(value);
    };

    // MODIFY handleHappinessChange to change db
    /*
    const handleHappinessChange = (newHappiness: Happiness) => {
        setOpen(false); // Close the dialog after selecting mood

        // Update moodData state with the new mood for the selected day
        const updatedMoodlogsData = [...moodlogsModifiedDataForCalendar];
        const dayIndex = props.day.date() - 1;

        console.log('this is day index:', updatedMoodlogsData[dayIndex])
        console.log('this is updatedMoodlogsData', updatedMoodlogsData)
        updatedMoodlogsData[dayIndex] = {
            ...updatedMoodlogsData[dayIndex],
            happinesslevel: happinessValueMap[newHappiness], // Update the happiness level
        };
        console.log('this is day index2:', updatedMoodlogsData[dayIndex])
        console.log('this is updatedMoodlogsData', updatedMoodlogsData)
        const updatedMoodLog = {
            email: email,
            logdatetime: day,
            happinesslevel: happinessValueMap[newHappiness], // New happiness selected by the user
        };
        setMoodlogsModifiedDataForCalendar(updatedMoodlogsData);
        updateMoodLog(updatedMoodLog); // pass the new moodlog back to calendar --> back to moodlog component --> gql update 
    };
    */

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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>{`Mood for ${day.format('D MMM YYYY, dddd')}`}</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers>
                    <div className={styles.popUp}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="overall-feeling-id"
                            label="How did I feel on this day?"
                            type="text"
                            fullWidth
                            value={inputValue}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.popUp}>
                        <InputLabel id="happy-range-label-id">Select Happiness Level:</InputLabel>
                        <HappyRangeSlider onHappyRangeChange={handleHappyRangeChange}></HappyRangeSlider>
                    </div>
                    <InputLabel id="most-impact-label-id">What has the most impact on you?</InputLabel>
                    <Select
                        labelId="most-impact-label-id"
                        id="most-impact-id"
                        value={happiness}
                        onChange={handleMostImpactDropdownChange}
                        sx={{ width: '100%' }}
                    >
                        <MenuItem value={"Family"}>Family <MdOutlineFamilyRestroom className={styles.menuItemIcon} /></MenuItem>
                        <MenuItem value={"Friends"}>Friends <GiThreeFriends className={styles.menuItemIcon} /></MenuItem>
                        <MenuItem value={"Work"}>Work<MdWork className={styles.menuItemIcon} /></MenuItem>
                        <MenuItem value={"Life"}>Life <MdNightlife className={styles.menuItemIcon} /></MenuItem>
                        <MenuItem value={"Study"}>Study <PiStudentFill className={styles.menuItemIcon} /></MenuItem>
                        <MenuItem value={"Others"}>Others</MenuItem>
                    </Select>
                    {/* <div className='m-2'>
                        <button className='btn btn-primary m-1' onClick={() => handleHappinessChange('very unhappy')}>Very Unhappy</button>
                        <button className='btn btn-primary m-1' onClick={() => handleHappinessChange('unhappy')}>Unhappy</button>
                        <button className='btn btn-primary m-1' onClick={() => handleHappinessChange('neutral')}>Neutral</button>
                        <button className='btn btn-primary m-1' onClick={() => handleHappinessChange('happy')}>Happy</button>
                        <button className='btn btn-primary m-1' onClick={() => handleHappinessChange('very happy')}>Very Happy</button>
                    </div> */}
                </DialogContent>
            </Dialog >
        </>
    );
}


const Calendar: FC<CalendarProps> = ({ email, moodlogs, updateMoodLog }) => {
    /**
     * This component takes in
     * 1. moodlogs: list of all the moodlogs created by user
     * 2. updateMoodLog: function to update moodlog
     */
    const requestAbortController = useRef<AbortController | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
    const [moodlogsOriginalData, setMoodlogsOriginalData] = useState<DailyMoodLog[]>(moodlogs[0]?.getAllMoodLogs || []); // this depends on prop data
    const [moodlogsModifiedDataForCalendar, setMoodlogsModifiedDataForCalendar] = useState<DailyMoodLog[]>([]); // this depends on month selected

    // Initialize prop data into moodlogsOriginalData
    useEffect(() => {
        if (moodlogs.length !== 0) {
            console.log("Initializing moodlogsOriginalData state with:", moodlogs[0].getAllMoodLogs);
            setMoodlogsOriginalData(moodlogs[0].getAllMoodLogs);
        }
    }, [moodlogs]);

    // Initialize current month's array based on today's date & moodlogsModifiedDataForCalendar 
    useEffect(() => {
        if (moodlogsOriginalData.length > 0) {
            console.log("This is CURRENT_DATE before generating:", CURRENT_DATE);
            console.log("This is moodlogsModifiedDataForCalendar state before generating:", moodlogsModifiedDataForCalendar);
        }
    }, []);

    /*
    LOGGING STATEMENTS
    */
    useEffect(() => {
        if (moodlogsOriginalData.length > 0) {
            setIsLoading(true);
            console.log("moodlogsOriginalData updated:", moodlogsOriginalData); // Log moodlogsOriginalData after it's updated
            prepareCalendarArray(email, CURRENT_DATE, moodlogsOriginalData);
        }
    }, [moodlogsOriginalData]);

    useEffect(() => {
        if (moodlogsModifiedDataForCalendar.length > 0) {
            console.log("moodlogsModifiedDataForCalendar updated:", moodlogsModifiedDataForCalendar); // Log moodlogsModifiedDataForCalendar after it's updated
        }
    }, [moodlogsModifiedDataForCalendar]);

    /*
    HELPER FUNCTIONS
    */

    const prepareCalendarArray = (email: string, date: Dayjs, moodlogsOriginalData: DailyMoodLog[]) => {
        console.log('Generating calendar array...', moodlogsOriginalData)
        const controller = new AbortController();
        if (moodlogsOriginalData.length !== 0) {
            generateMonthArray(email, date, moodlogsOriginalData, {
                signal: controller.signal,
            })
                .then(({ daysToHighlight, outputMoodlogsData }) => {
                    setHighlightedDays(daysToHighlight); // not used - kiv if want to use
                    setMoodlogsModifiedDataForCalendar(outputMoodlogsData);
                    setIsLoading(false);
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

    const handleMonthChange = (date: Dayjs) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }
        setIsLoading(true);
        setHighlightedDays([]);
        prepareCalendarArray(email, date, moodlogsOriginalData);
    };

    const updateMoodlogsData = (updatedMoodlogsData: DailyMoodLog[]) => {
        setMoodlogsOriginalData(updatedMoodlogsData);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
            <DateCalendar
                defaultValue={CURRENT_DATE}
                loading={isLoading}
                onMonthChange={handleMonthChange}
                renderLoading={() => <DayCalendarSkeleton />}
                slots={{
                    day: (props) =>
                        <DayComponent
                            {...props}
                            email={email}
                            moodlogsModifiedDataForCalendar={moodlogsModifiedDataForCalendar}
                            setMoodlogsModifiedDataForCalendar={setMoodlogsModifiedDataForCalendar}
                            updateMoodLog={updateMoodLog}
                        />
                    ,
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