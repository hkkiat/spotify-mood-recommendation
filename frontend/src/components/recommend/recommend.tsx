import { FC, FormEvent, useEffect, useState } from 'react';
import Layout from '../common/layout';
import Calendar from '../moodlog/calendar';
import MoodLog from '../moodlog/moodlog';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { getAllMoodLogsQuery } from '../../graphql/queries/MoodLogQueries';
import { getAllMoodLogs, getAllMoodLogsVariables } from '../../graphql/queries/__generated__/getAllMoodLogs';
import axios from 'axios';
import SpotifyPlayer from './SpotifyPlayer'; // Corrected the import and capitalized the component name
import SpotifyButton from './spotifybutton';
import PlaylistButton from './playlistbutton';
import MoodStatsBox from './moodstatsbox';
import styles from '../../css/recommend.module.css';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import gloomyImage from '../../images/fog.jpg';
import happyImage from '../../images/happy.jpg';
import veryHappyImage from '../../images/veryhappy.jpg';
import neutralImage from '../../images/neutral.jpg';
import veryUnhappyImage from '../../images/veryunhappy.jpeg';
import unhappyImage from '../../images/unhappy.jpeg';





// import DiscoverButton from './SpotifyButton';

axios.defaults.withCredentials = true;
const { updateMoodLog } = require('../moodlog/moodlog'); // Ensure path correctness


interface RecommendationProps {
  email: string;
  currentPage: string;
}

interface MoodData {
  averageMood: number | null;
  highestMood: number | null;
  lowestMood: number | null;
  numLogs: number | null;
}

const Recommendation: React.FC<RecommendationProps> = ({ email, currentPage }) => {
  const [averageMood, setAverageMood] = useState<number | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [moodlogs, setMoodLogs] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<MoodData>({
    averageMood: null,
    highestMood: null,
    lowestMood: null,
    numLogs: 0
  });
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [checked, setChecked] = useState(false);
  const [timePeriod, setTimePeriod] = useState('7days'); // Default to last 7 days
  const { loading, error, data } = useQuery<getAllMoodLogs, getAllMoodLogsVariables>(getAllMoodLogsQuery, {
    variables: { email: email },
  });
  
  
  useEffect(() => {
    if (data) {
      setMoodLogs(prevMoodLogs => [...prevMoodLogs, data]);
      console.log('Mood log data from GQL query: ', data);
    }
  }, [data]);

  // useEffect(() => {
  //   // TO UPDATE: update this to cover only past 7 days - currently it covers past 7 mood logs
  //   if (data && data.getAllMoodLogs && data.getAllMoodLogs.length > 0) {
  //     const recentLogs = data.getAllMoodLogs.slice(-7);
  //     const sumMood = recentLogs.reduce((acc, log) => acc + (log?.happinesslevel ?? 0), 0);
  //     const avgMood = sumMood / recentLogs.length;
  //     console.log("Calculated Average Mood:", avgMood);  // Debugging output
  //     setAverageMood(avgMood);
  //   }
  // }, [data]);
  useEffect(() => {
    if (data && data.getAllMoodLogs && data.getAllMoodLogs.length > 0) {
      const currentTime = new Date();
      currentTime.setHours(0, 0, 0, 0); // Normalize today to midnight
  
      let comparisonDate = new Date();
      switch (timePeriod) {
        case 'today':
          comparisonDate = currentTime;
          break;
        case '7days':
          comparisonDate.setDate(currentTime.getDate() - 7);
          break;
        case '30days':
          comparisonDate.setDate(currentTime.getDate() - 30);
          break;
        default:
          comparisonDate.setDate(currentTime.getDate() - 7); // Default case
      }
  
      // Filter logs based on the chosen time period
      const filteredLogs = data.getAllMoodLogs.filter(log => 
        log !== null && log.logdatetime && new Date(log.logdatetime) >= comparisonDate
      );
        //   const moods = recentLogs.map(log => (log as { happinesslevel: number }).happinesslevel);

      if (filteredLogs.length > 0) {
        const moods = filteredLogs.map(log => (log as { happinesslevel: number }).happinesslevel);
        const sumMood = filteredLogs.reduce((acc, log) => {
            // Check if log is not null again to placate TypeScript's strict null checks
            return acc + (log ? (log.happinesslevel ?? 0) : 0);
          }, 0);        
        const avgMood = sumMood / filteredLogs.length;
        const highestMood = Math.max(...moods);
        const lowestMood = Math.min(...moods);
        console.log(lowestMood)
        setAverageMood(avgMood);
        localStorage.setItem('averageMood', JSON.stringify(avgMood));


  
        setMoodData({
          averageMood: avgMood,
          highestMood,
          lowestMood,
          numLogs: moods.length
        });
      } else {
        // Reset mood data if no logs match the filter
        setMoodData({
          averageMood: 0,
          highestMood: 0,
          lowestMood: 0,
          numLogs: 0
        });
      }
    }
  }, [data, timePeriod]); // Add timePeriod to dependency array
  
//   useEffect(() => {
//     if (data && data.getAllMoodLogs && data.getAllMoodLogs.length > 0) {
//       const sevenDaysAgo = new Date();
//       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
//       sevenDaysAgo.setHours(0, 0, 0, 0); // Normalize the time part to midnight
  
//       // Filter logs to include only those from the past 7 days and ensure logs are not null
//       const recentLogs = data.getAllMoodLogs.filter(log => 
//         log && log.logdatetime && new Date(log.logdatetime) > sevenDaysAgo
//       );

//       if (recentLogs.length > 0) {
//         const moods = recentLogs.map(log => (log as { happinesslevel: number }).happinesslevel);
//         const sumMood = recentLogs.reduce((acc, log) => acc + (log?.happinesslevel ?? 0), 0);
//         const avgMood = sumMood / recentLogs.length;
//         const highestMood = Math.max(...moods);
//         const lowestMood = Math.min(...moods);
//         console.log("Calculated Average Mood:", avgMood);  // Debugging output
//         setAverageMood(avgMood);
//         localStorage.setItem('averageMood', JSON.stringify(avgMood));
//         console.log(localStorage.getItem('averageMood'))

//         setMoodData({
//           averageMood: avgMood,
//           highestMood,
//           lowestMood,
//           numLogs: moods.length
//         });
//       }
//     }
//   }, [data]); 
  

  useEffect(() => {
    // Function to handle the URL check and playlist creation
    const queryParams = new URLSearchParams(window.location.search);
    const authorized = queryParams.get('authorized');
    console.log('Authorisation check: ', authorized);

    if (authorized && localStorage.getItem('createPlaylistAfterAuth')) {
      console.log('running after redirection')
      createPlaylist();
      // Remove query parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [currentPage]); // Dependency on currentPage to ensure re-evaluation if needed
  console.log(data)

  // useEffect(() => {
  //   const storedMood = localStorage.getItem('averageMood');
  //   if (storedMood) {
  //     setAverageMood(JSON.parse(storedMood));
  //     localStorage.removeItem('averageMood'); // Clear it if you don't need it anymore after loading
  //   }
  // }, []);
  
  // TO UPDATE: retrieve userId from db instead of hardcoding. Also, to include email address in backend for spotifyUser collection, and pass email when calling routes, where necessary).
  // const handleAuthorizeAndCreatePlaylist = async () => {
  //   try {
  //     console.log('check-auth in handle');
  //     const { data: authStatus } = await axios.get('http://localhost:8000/api/spotify/check-authorization', { withCredentials: true });
  //     if (!authStatus.isAuthorized) {
  //       // sessionStorage.setItem('averageMood', JSON.stringify(averageMood)); // Save the current mood to sessionStorage
  //       console.log('getauthurl in handle');
  //       const { data: authData } = await axios.get('http://localhost:8000/api/spotify/auth-url', { withCredentials: true });
  //       localStorage.setItem('createPlaylistAfterAuth', 'true');
  //       window.location.href = authData.url;
  //       return;
  //     }
  
  //     // This console can help you see what the average mood is when the function runs
  //     console.log('Average Mood:', averageMood);
  
  //     // Check if we are back after authorization and if there's an average mood available
  //     // if (averageMood && localStorage.getItem('createPlaylistAfterAuth') === 'true') {
  //     if (averageMood) {
  //       console.log('creating playlist')
  //       const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { moodvalue: averageMood }, { withCredentials: true });
  //       // setPlaylistId(response.data.id);
  //       // alert('Playlist created successfully!');
  //       // localStorage.removeItem('createPlaylistAfterAuth');
  //       if (response.data) {
  //         setPlaylistId(response.data.id);
  //         alert('Playlist created successfully!');
  //         localStorage.removeItem('createPlaylistAfterAuth');
  //         // sessionStorage.removeItem('averageMood'); // Remove the mood from sessionStorage after it's used
  //       } else {
  //       alert('No sufficient mood data to create playlist.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     alert('An error occurred while processing your request.');
  //   }
  // };
  const handleAuthorizeAndCreatePlaylist = async () => {
    try {
      // Check if we are back after authorization and a playlist should be created
      if (localStorage.getItem('createPlaylistAfterAuth')) {
        console.log('Returned after authorization, proceeding to create playlist');
        createPlaylist();
      } else {
        console.log('Not yet authorized, checking authorization status');
        // console.log('set averagemood')
        // localStorage.setItem('averageMood', JSON.stringify(averageMood));
        await checkAndHandleAuthorization();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };
  
  const checkAndHandleAuthorization = async () => {
    const { data: authStatus } = await axios.get('http://localhost:8000/api/spotify/check-authorization', { withCredentials: true });
    if (!authStatus.isAuthorized) {
      console.log('User not authorized, fetching authorization URL');
      const { data: authData } = await axios.get('http://localhost:8000/api/spotify/auth-url', { withCredentials: true });
      localStorage.setItem('createPlaylistAfterAuth', 'true');
      window.location.href = authData.url;
    } else {
      // User is authorized but the function was called not via redirection
      createPlaylist();
    }
  };
  
  const createPlaylist = async () => {
    const storedMood = localStorage.getItem('averageMood'); 
    // if (storedMood) {
    //   const moodValue = JSON.parse(storedMood);
    //   console.log('parsed stored mode: ', moodValue);
    //   console.log('stored mode: ', storedMood);
    //   setAverageMood(JSON.parse(storedMood));
    //   // console.log('average mood: ', averageMood);
    // }
    let moodValue;
    console.log('createplaylist', storedMood)
    if (averageMood) {
      moodValue = averageMood;
      console.log('Creating playlist with average mood:', moodValue);
      setIsCreatingPlaylist(true);  // Set loading state to true
    }
    else if (storedMood) {
      moodValue = JSON.parse(storedMood);
      console.log('Creating playlist with stored mood:', moodValue);
      setIsCreatingPlaylist(true);  // Set loading state to true
    }
    else {
      alert('No sufficient mood data to create a playlist. Please log your moods over that past 7 days to use this feature.'); 
    }
    if (moodValue) {
      try {
        setIsCreatingPlaylist(true);  // Set loading state to true
        const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { moodvalue: moodValue }, { withCredentials: true });
        if (response.data) {
          setPlaylistId(response.data.id);
          alert('Playlist created successfully!');
        } else {
          alert('No sufficient mood data to create a playlist.');
        }
      } catch (error) {
        console.error('Error creating playlist:', error);
        alert('An error occurred while processing your request.');
      } finally {
        setIsCreatingPlaylist(false);  // Set loading state to false regardless of outcome
      }
    }
    // if (storedMood) {
    //   setIsCreatingPlaylist(true);  // Set loading state to true
    //   console.log('Creating playlist with average mood:', storedMood);
    //   const moodValue = JSON.parse(storedMood);
    //   try {
    //     const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { moodvalue: moodValue }, { withCredentials: true });
    //     if (response.data) {
    //       setPlaylistId(response.data.id);
    //       alert('Playlist created successfully!');
    //     } else {
    //       alert('No sufficient mood data to create a playlist.');
    //     }
    //   } catch (error) {
    //     console.error('Error creating playlist:', error);
    //     alert('An error occurred while processing your request.');
    //   } finally {
    //     setIsCreatingPlaylist(false);  // Set loading state to false regardless of outcome
    //   }
    //   // const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { moodvalue: storedMood }, { withCredentials: true });
    //   // if (response.data) {
    //   //   setPlaylistId(response.data.id);
    //   //   alert('Playlist created successfully!');
    //   // } else {
    //   //   alert('No sufficient mood data to create a playlist.');
    //   // }
    // }
    // Clear the flag regardless of playlist creation success to prevent unintended re-entries
    localStorage.removeItem('createPlaylistAfterAuth');
    localStorage.removeItem('averageMood'); // Optionally clear it after loading
  };

  // Utility function to determine the image URL
  function getImageBasedOnNumber(number: number | null): string {
    if (number === null) {
      return gloomyImage; // 
    } else if (number >= 0.875) {
        return veryHappyImage; // Path for high values
    } else if (number >= 0.625) {
        return happyImage; // Path for medium values
    } else if (number >= 0.375) {
      return neutralImage; // Path for medium values
    } else if (number >= 0.125) {
      return unhappyImage; // Path for medium values
    } else {
      return veryUnhappyImage; // Path for low values
    }
}

  // useEffect(() => {
  //   if (averageMood != null && localStorage.getItem('createPlaylistAfterAuth') === 'true') {
  //     console.log('second call')
  //     handleAuthorizeAndCreatePlaylist();
  //     console.log('end of second call')
  //   }
  // }, [averageMood]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log(error)
    return <p>Error loading mood logs!</p>;
  };
  return (
    <div>
        <Layout currentPage={currentPage}>
        <div className={styles.centerContainer}>
            {/* <Calendar email={email} moodlogs={moodlogs} updateMoodLog={updateMoodLog} /> */}
            {/* <center> */}
            <div className={styles.centerText}>
                <br/>
                <h1>MoodBooster</h1>
                <br/>
                <h6> Create a Spotify playlist personalised to your mood and music taste </h6>
                <br/>
            </div>
            <div>
                <ToggleButtonGroup type="radio" name="options" defaultValue={2}>
                    <ToggleButton id="tbg-check-1" variant="outline-primary" value={1} onClick={() => setTimePeriod('today')}>
                    Today
                    </ToggleButton>
                    <ToggleButton id="tbg-check-2" variant="outline-primary" value={2} onClick={() => setTimePeriod('7days')}>
                    Last 7 Days
                    </ToggleButton>
                    <ToggleButton id="tbg-check-3" variant="outline-primary" value={3} onClick={() => setTimePeriod('30days')}>
                    Last 30 Days
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <br/>
            <div className={styles.buttonContainer}>
                <PlaylistButton imageUrl={gloomyImage} label="Moods Logged" number={moodData.numLogs} />
                <PlaylistButton
                    imageUrl={getImageBasedOnNumber(moodData.averageMood)}
                    label="Average Mood"
                    number={typeof moodData.averageMood === 'number' ? moodData.averageMood.toFixed(2) : 'N/A'}
                />
                <PlaylistButton
                    imageUrl={getImageBasedOnNumber(moodData.highestMood)}
                    label="Highest Mood"
                    number={typeof moodData.highestMood === 'number' ? moodData.highestMood.toFixed(2) : 'N/A'}
                />
                <PlaylistButton
                    imageUrl={getImageBasedOnNumber(moodData.lowestMood)}
                    label="Lowest Mood"
                    number={typeof moodData.lowestMood === 'number' ? moodData.lowestMood.toFixed(2) : 'N/A'}
                />
                {/* You can add more buttons here */}
              </div>
              <br/>

            {/* <div className={styles.moodStatsContainer}>
                <MoodStatsBox label="Number of Logs" value={moodData.numLogs} isInteger={true} enableHoverEffect={false} />
                <MoodStatsBox label="Average Mood" value={moodData.averageMood} enableHoverEffect={true} />
                <MoodStatsBox label="Highest Mood" value={moodData.highestMood} enableHoverEffect={true} />
                <MoodStatsBox label="Lowest Mood" value={moodData.lowestMood} enableHoverEffect={true} />
            </div> */}
            {/* <h2>Generate a Playlist Based on Your Weekly Mood</h2> */}
            <div>         
            <SpotifyButton onClick={checkAndHandleAuthorization} buttonText="Create your MoodBooster Playlist"/>
            </div>
            {isCreatingPlaylist && (
            <div>
                <div className={styles.spinner}>
                <div className={styles.bounce1}></div>
                <div className={styles.bounce2}></div>
                <div className={styles.bounce3}></div>
                </div>
                <div>Creating your playlist... Please wait...</div>
            </div>
            // {/* // <div>
            // //   <div className={styles.spinner}></div> Creating your playlist, please wait...
            // // </div> */}
            )}
            {/* <button onClick={checkAndHandleAuthorization} disabled={isCreatingPlaylist}>
            {isCreatingPlaylist ? 'Creating Playlist...' : 'Authorize & Create Playlist'}
            </button> */}
            <br/>
            <br/>
            {playlistId && <SpotifyPlayer playlistId={playlistId} />}
            
            {/* <button onClick={handleAuthorizeAndCreatePlaylist}>
            Authorize & Create Playlist
            </button>
            {playlistId && <SpotifyPlayer playlistId={playlistId} />}  */}
            {/* </center> */}
        </div>
        </Layout>
    </div>
  );
};

export default Recommendation;

