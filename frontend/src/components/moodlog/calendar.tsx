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
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { getAllMoodLogs_getAllMoodLogs } from '../../graphql/queries/__generated__/getAllMoodLogs';


//const CURRENT_DATE = dayjs(); // current date

type Happiness = 'very happy' | 'happy' | 'neutral' | 'unhappy' | 'very unhappy'

const happinessValueMap: Record<Happiness, number> = {
    'very happy': 1,
    'happy': 0.75,
    'neutral': 0.5,
    'unhappy': 0.25,
    'very unhappy': 0,
};

interface MoodLogData {
    overallfeeling: string;
    happinesslevel: number;
    mostimpact: string;
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
    email: string;
    moodlogs: getAllMoodLogs_getAllMoodLogs[];
    //moodlogs: any[]; // Assuming moodlogs is an array of mood log data
    updateMoodLog: (updatedMoodLog: any) => void;
    displayMonth: Dayjs;
    updateDisplayMonth: (newDisplayMonth: Dayjs) => void;
}

function generateMonthArray(email: string, date: Dayjs, moodlogsModifiedDataForCalendar: DailyMoodLog[], { signal }: { signal: AbortSignal }) {
    return new Promise<{ daysToHighlight: number[]; outputMoodlogsData: DailyMoodLog[] }>((resolve, reject) => {
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            // Months are zero indexed, so January is month 0.
            const targetMonth = date.month() + 1
            const targetYear = date.year()
            const daysToHighlight: number[] = []; // not used - KIV in case we want to highlight certain days
            const outputMoodlogsData: DailyMoodLog[] = [];

            for (let i = 1; i <= daysInMonth; i++) {
                const matchingItem = moodlogsModifiedDataForCalendar.find(
                    (item) => {
                        return (new Date(item.logdatetime).getDate() === i &&
                        new Date(item.logdatetime).getMonth() + 1 === targetMonth &&
                        new Date(item.logdatetime).getFullYear() === targetYear)
                });

                if (matchingItem) {
                    // If data exists, add it to the outputMoodlogsData array
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
    const isFutureDate = day.isAfter(dayjs(), 'day'); // Checks if the 'day' is after today
    const [open, setOpen] = useState(false);
    const [initialMoodLogData, setInitialMoodLogData] = useState<MoodLogData | null>(null); // State to store initial mood log data
    const [overallFeeling, setOverallFeeling] = useState('');
    const [happinessLevel, setHappinessLevel] = useState(0.5);
    const [mostImpact, setMostImpact] = useState('');

    useEffect(() => {
        // Update state when mood logs change
        setOverallFeeling(moodlogsModifiedDataForCalendar[day.date() - 1]?.overallfeeling || '');
        setHappinessLevel(moodlogsModifiedDataForCalendar[day.date() - 1]?.happinesslevel || 0.5);
        setMostImpact(moodlogsModifiedDataForCalendar[day.date() - 1]?.mostimpact || '');
    }, [day, moodlogsModifiedDataForCalendar]);

    const isCurrentDate = dayjs().isSame(day, 'day'); // Check if the day is the current date to determine if icon should be displayed


    const happinessLevelForColor = moodlogsModifiedDataForCalendar[props.day.date() - 1]?.happinesslevel; // Adjust index to match day
    const colorMap: Record<string, string> = {
        '1': 'green', 
        '0.75': 'lightgreen',
        '0.5': 'yellow',
        '0.25': 'orange',
        '0': 'red'
    };
    const backgroundColor = colorMap[happinessLevelForColor] || 'lightgrey';
    const dayStyle = isFutureDate ? { backgroundColor: 'white', cursor: 'not-allowed' } : { backgroundColor };

    const handleClick = () => {
        if (!isFutureDate) {  // Only open the dialog if it's not a future date
            setOpen(true);
            setInitialMoodLogData({
                overallfeeling: overallFeeling,
                happinesslevel: happinessLevel,
                mostimpact: mostImpact
            });
        }
        
    };

    const handleClose = () => {
        setOpen(false);
        if (initialMoodLogData) {
            setOverallFeeling(initialMoodLogData.overallfeeling);
            setHappinessLevel(initialMoodLogData.happinesslevel);
            setMostImpact(initialMoodLogData.mostimpact);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setOverallFeeling(event.target.value);
    };

    const handleMostImpactDropdownChange = (event: SelectChangeEvent) => {
        setMostImpact(event.target.value as string);
    };

    const handleHappyRangeChange = (value: number) => {
        setHappinessLevel(value);
    };

    const handleUpdate = () => {
        // Gather data from all fields and perform necessary actions
        const updatedData = {
            overallFeeling: overallFeeling,
            happinessLevel: happinessLevel,
            mostImpact: mostImpact
        };
        // Update state or perform other actions with the collected data

        const dayIndex = props.day.date() - 1;
        const updatedMoodlogsData = [...moodlogsModifiedDataForCalendar];

        updatedMoodlogsData[dayIndex] = {
            ...updatedMoodlogsData[dayIndex],
            // Update fields with new data
            overallfeeling: updatedData.overallFeeling,
            happinesslevel: updatedData.happinessLevel,
            mostimpact: updatedData.mostImpact
        };

        const updatedMoodLog = {
            email: email,
            logdatetime: day,
            overallfeeling: updatedData.overallFeeling,
            happinesslevel: updatedData.happinessLevel,
            mostimpact: updatedData.mostImpact
        };

        setMoodlogsModifiedDataForCalendar(updatedMoodlogsData); // update calendar state
        updateMoodLog(updatedMoodLog) // pass the new moodlog back to calendar --> back to moodlog component --> gql update 
    };

    return (
        <>
            <Tooltip title={isFutureDate ? "Cannot select future dates" : "Click to edit"}>
                <div>
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
                                sx={dayStyle}
                                onClick={handleClick} // This will now prevent action for future dates
                            />
                        </Badge>
                    )}
                    {!isCurrentDate && (
                        <PickersDay
                            {...other}
                            outsideCurrentMonth={outsideCurrentMonth}
                            day={day}
                            sx={dayStyle}
                            onClick={handleClick}
                        />
                    )}
                </div>
            </Tooltip>
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
                            value={overallFeeling}
                            onChange={handleChange}
                        />
                    </div>
                    <div className={styles.popUp}>
                        <InputLabel id="happy-range-label-id">Select Happiness Level:</InputLabel>
                        <HappyRangeSlider happinessLevel={happinessLevel} onHappyRangeChange={handleHappyRangeChange}></HappyRangeSlider>
                    </div>
                    <InputLabel id="most-impact-label-id">What has the most impact on you?</InputLabel>
                    <Select
                        labelId="most-impact-label-id"
                        id="most-impact-id"
                        value={mostImpact}
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleUpdate}>Edit</Button>
                    </Box>
                </DialogContent>
            </Dialog >
        </>
    );
}


const Calendar: FC<CalendarProps> = ({ email, moodlogs, updateMoodLog, displayMonth, updateDisplayMonth }) => {
    /**
     * This component takes in
     * 1. moodlogs: list of all the moodlogs created by user
     * 2. updateMoodLog: function to update moodlog
     */
    const requestAbortController = useRef<AbortController | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState<number[]>([]);
    const [moodlogsOriginalData, setMoodlogsOriginalData] = useState<DailyMoodLog[]>(moodlogs || []); // this depends on prop data
    const [moodlogsModifiedDataForCalendar, setMoodlogsModifiedDataForCalendar] = useState<DailyMoodLog[]>([]); // this depends on month selected

    
    useEffect(() => {
        setMoodlogsOriginalData(moodlogs);
        setIsLoading(true);
        prepareCalendarArray(email, displayMonth, moodlogs);
    }, [moodlogs]);

   
    /*
    HELPER FUNCTIONS
    */

    const prepareCalendarArray = (email: string, date: Dayjs, moodlogsOriginalData: DailyMoodLog[]) => {
        const controller = new AbortController();
        //if (moodlogsOriginalData.length !== 0) {
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
        //}

    };

    const handleMonthChange = (date: Dayjs) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        // if (moodlogsOriginalData.length === 0) { // Check if there are any mood logs
        //     // alert('No mood log data available. Please log your mood today first.'); // Display alert
        //     return; // Prevent calendar from navigating to other months
        // }

        setIsLoading(true);
        setHighlightedDays([]);
        // set parents displaymonth
        updateDisplayMonth(date);
        prepareCalendarArray(email, date, moodlogsOriginalData);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
            <DateCalendar
            

                value={displayMonth}
                loading={isLoading}
                onMonthChange={handleMonthChange}
                renderLoading={() => <DayCalendarSkeleton />}
                slots={
                    {
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