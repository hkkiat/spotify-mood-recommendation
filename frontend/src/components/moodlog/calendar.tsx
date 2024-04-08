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

function getRandomNumber(min: number, max: number) {
    return Math.round(Math.random() * (max - min) + min);
}

const initialValue = dayjs(); // current date

type Mood = 'happy' | 'sad' | 'neutral';

interface DayData {
    mood: Mood;
}

interface CalendarProps {
    moodlogs: any[]; // Assuming moodlogs is an array of mood log data
}

function fakeFetch(date: Dayjs, { signal }: { signal: AbortSignal }) {
    return new Promise<{ daysToHighlight: number[]; moodData: DayData[] }>((resolve, reject) => {
        const timeout = setTimeout(() => {
            const daysInMonth = date.daysInMonth();
            const daysToHighlight = [1, 2, 3].map(() => getRandomNumber(1, daysInMonth));
            const moodData: DayData[] = Array.from({ length: daysInMonth }, () => ({
                mood: ['happy', 'sad', 'neutral'][getRandomNumber(0, 2)] as Mood // Cast the mood as Mood
            }));

            resolve({ daysToHighlight, moodData });
        }, 500);

        signal.onabort = () => {
            clearTimeout(timeout);
            reject(new DOMException('aborted', 'AbortError'));
        };
    });
}

function ServerDay(props: PickersDayProps<Dayjs> & { highlightedDays?: number[]; moodData: DayData[]; updateMoodData: (updatedMoodData: DayData[]) => void }) {
    const { highlightedDays = [], moodData, day, outsideCurrentMonth, updateMoodData, ...other } = props;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

    const isCurrentDate = dayjs().isSame(day, 'day'); // Check if the day is the current date

    const mood = moodData[props.day.date() - 1]?.mood || selectedMood; // Adjust index to match day

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
                        sx={{ backgroundColor: mood === 'happy' ? 'lightgreen' : mood === 'sad' ? 'lightpink' : 'lightgray' }}
                        onClick={handleClick} // Keep onClick for current dates
                    />
                </Badge>
            )}
            {!isCurrentDate && (
                <PickersDay
                    {...other}
                    outsideCurrentMonth={outsideCurrentMonth}
                    day={day}
                    sx={{ backgroundColor: mood === 'happy' ? 'lightgreen' : mood === 'sad' ? 'lightpink' : 'lightgray' }}
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

    if (moodlogs.length !== 0) {
        const moodlogsArray = moodlogs[0].getAllMoodLogs
        console.log("This is inside Calendar", moodlogsArray)
    }
    const fetchHighlightedDays = (date: Dayjs) => {
        const controller = new AbortController();
        fakeFetch(date, {
            signal: controller.signal,
        })
            .then(({ daysToHighlight, moodData }) => {
                setHighlightedDays(daysToHighlight);
                setMoodData(moodData);
                setIsLoading(false);
            })
            .catch((error) => {
                // ignore the error if it's caused by `controller.abort`
                if (error.name !== 'AbortError') {
                    throw error;
                }
            });

        requestAbortController.current = controller;
    };

    useEffect(() => {
        fetchHighlightedDays(initialValue);
        // abort request on unmount
        return () => requestAbortController.current?.abort();
    }, []);

    const handleMonthChange = (date: Dayjs) => {
        if (requestAbortController.current) {
            // make sure that you are aborting useless requests
            // because it is possible to switch between months pretty quickly
            requestAbortController.current.abort();
        }

        setIsLoading(true);
        setHighlightedDays([]);
        fetchHighlightedDays(date);
    };

    const updateMoodData = (updatedMoodData: DayData[]) => {
        setMoodData(updatedMoodData);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
            <DateCalendar
                defaultValue={initialValue}
                loading={isLoading}
                onMonthChange={handleMonthChange}
                renderLoading={() => <DayCalendarSkeleton />}
                slots={{
                    day: (props) => <ServerDay {...props} moodData={moodData} updateMoodData={updateMoodData} />,
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