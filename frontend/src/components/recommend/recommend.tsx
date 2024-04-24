import { FC, FormEvent, useEffect, useState } from 'react';
import Layout from '../common/layout';
import OverallFeeling from '../moodlog/overallfeeling';
import HappyRange from '../moodlog/happyrange';
import MostImpact from '../moodlog/mostimpact';
import Calendar from '../moodlog/calendar';
import { useMutation, useQuery } from '@apollo/client';
import { getAllMoodLogsQuery } from '../../graphql/queries/MoodLogQueries';
import { getAllMoodLogs, getAllMoodLogsVariables } from '../../graphql/queries/__generated__/getAllMoodLogs';
import { createMoodLog, createMoodLogVariables } from '../../graphql/mutations/__generated__/createMoodLog';
import { createMoodLogMutation } from '../../graphql/mutations/MoodLogMutations';
import axios from 'axios';
import SpotifyPlayer from './SpotifyPlayer'; // Corrected the import and capitalized the component name

interface RecommendationProps {
  email: string;
  currentPage: string;
}

const Recommendation: React.FC<RecommendationProps> = ({ email, currentPage }) => {
  const [averageMood, setAverageMood] = useState<number | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const { loading, error, data } = useQuery<getAllMoodLogs, getAllMoodLogsVariables>(getAllMoodLogsQuery, {
    variables: { email: email },
  });
  console.log(data)

  useEffect(() => {
    // TO UPDATE: update this to cover only past 7 days - currently it covers past 7 mood logs
    if (data && data.getAllMoodLogs && data.getAllMoodLogs.length > 0) {
      const recentLogs = data.getAllMoodLogs.slice(-7);
      const sumMood = recentLogs.reduce((acc, log) => acc + (log?.happinesslevel ?? 0), 0);
      const avgMood = sumMood / recentLogs.length;
      console.log("Calculated Average Mood:", avgMood);  // Debugging output
      setAverageMood(avgMood);
    }
  }, [data]);

  useEffect(() => {
    // Function to handle the URL check and playlist creation
    const queryParams = new URLSearchParams(window.location.search);
    const authorized = queryParams.get('authorized');

    if (authorized && localStorage.getItem('createPlaylistAfterAuth')) {
      console.log('running after redirection')
      handleAuthorizeAndCreatePlaylist();
      // Remove query parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [currentPage]); // Dependency on currentPage to ensure re-evaluation if needed

  // useEffect(() => {
  //   const queryParams = new URLSearchParams(window.location.search);
  //   const authorized = queryParams.get('authorized');
  
  //   if (authorized && localStorage.getItem('createPlaylistAfterAuth')) {
  //     // const savedMood = sessionStorage.getItem('averageMood');
  //     if (savedMood) {
  //       setAverageMood(JSON.parse(savedMood));
  //       // sessionStorage.removeItem('averageMood');
  //       console.log('first call')
  //       handleAuthorizeAndCreatePlaylist(); // Only call this after setting the mood
  //       console.log('end of call')
  //     }
  //     // localStorage.removeItem('createPlaylistAfterAuth');
  //     window.history.replaceState(null, '', '/recommend');
  //   }
  // }, []);
  


  // useEffect(() => {
  //   const queryParams = new URLSearchParams(window.location.search);
  //   const isAuthorized = queryParams.get('authorized');
  //   if (isAuthorized && localStorage.getItem('createPlaylistAfterAuth')) {
  //     handleAuthorizeAndCreatePlaylist();
  //     localStorage.removeItem('createPlaylistAfterAuth');
  //     window.history.pushState(null, '', '/recommend'); // Clean up the URL
  //   }
  // }, []);

  // TO UPDATE: retrieve userId from db instead of hardcoding. Also, to include email address in backend for spotifyUser collection, and pass email when calling routes, where necessary).
  const handleAuthorizeAndCreatePlaylist = async () => {
    try {
      const { data: authStatus } = await axios.get('http://localhost:8000/api/spotify/check-authorization');
      if (!authStatus.isAuthorized) {
        // sessionStorage.setItem('averageMood', JSON.stringify(averageMood)); // Save the current mood to sessionStorage
        const { data: authData } = await axios.get('http://localhost:8000/api/spotify/auth-url');
        localStorage.setItem('createPlaylistAfterAuth', 'true');
        window.location.href = authData.url;
        return;
      }
  
      // This console can help you see what the average mood is when the function runs
      console.log('Average Mood:', averageMood);
  
      // Check if we are back after authorization and if there's an average mood available
      // if (averageMood && localStorage.getItem('createPlaylistAfterAuth') === 'true') {
      if (averageMood) {
        console.log('creating playlist')
        const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { userId: "cometohk", moodvalue: averageMood });
        // setPlaylistId(response.data.id);
        // alert('Playlist created successfully!');
        localStorage.removeItem('createPlaylistAfterAuth');
        if (response.data) {
          setPlaylistId(response.data.id);
          alert('Playlist created successfully!');
          // localStorage.removeItem('createPlaylistAfterAuth');
          // sessionStorage.removeItem('averageMood'); // Remove the mood from sessionStorage after it's used
        } else {
        alert('No sufficient mood data to create playlist.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };
  
  // Add this effect to run on mount and check if we need to create a playlist after authorization
//   useEffect(() => {
// //     const checkAndCreatePlaylist = async () => {
// //       try {
// //           const { data: authStatus } = await axios.get('http://localhost:8000/api/spotify/check-authorization');
// //           if (authStatus.isAuthorized) {
// //               if (localStorage.getItem('createPlaylistAfterAuth') === 'true') {
// //                   const averageMood = localStorage.getItem('averageMood'); // Ensure average mood was saved before redirecting
// //                   const response = await axios.post('http://localhost:8000/api/spotify/create-playlist', { moodvalue: averageMood });
// //                   alert('Playlist created successfully!');
// //                   localStorage.removeItem('createPlaylistAfterAuth');
// //               }
// //           } else {
// //               // Handle not authorized by redirecting to auth URL or showing an error
// //           }
// //       } catch (error) {
// //           console.error('Error:', error);
// //           alert('An error occurred while processing your request.');
// //       }
// //   };

// //   checkAndCreatePlaylist();
// // }, []);
//     if (localStorage.getItem('createPlaylistAfterAuth') === 'true' && averageMood) {
//       handleAuthorizeAndCreatePlaylist();
//     }
//   }, []);
  useEffect(() => {
    if (averageMood != null && localStorage.getItem('createPlaylistAfterAuth') === 'true') {
      console.log('second call')
      handleAuthorizeAndCreatePlaylist();
      console.log('end of second call')
    }
  }, [averageMood]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading mood logs!</p>;

  return (
    <Layout currentPage={currentPage}>
      <div>
        <h2>Generate a Playlist Based on Your Weekly Mood</h2>
        <button onClick={handleAuthorizeAndCreatePlaylist}>
          Authorize & Create Playlist
        </button>
        {playlistId && <SpotifyPlayer playlistId={playlistId} />} 
      </div>
    </Layout>
  );
};

export default Recommendation;

// const Recommendation: React.FC<RecommendationProps> = ({ email, currentPage }) => {
//   const [averageMood, setAverageMood] = useState<number | null>(null);
//   const { data, loading, error } = useQuery<getAllMoodLogs, getAllMoodLogsVariables>(getAllMoodLogsQuery, {
//     variables: { email: email },
//   });

//   useEffect(() => {
//     console.log("Fetched data: ", data);
//     if (data && data.getAllMoodLogs && data.getAllMoodLogs.length > 0) {
//       const recentLogs = data.getAllMoodLogs.slice(-7); // Assuming logs are sorted by date
//       if (recentLogs.length > 0) {
//         const sumMood = recentLogs.reduce((acc, log) => acc + (log?.happinesslevel ?? 0), 0);
//         const avgMood = sumMood / recentLogs.length;
//         setAverageMood(avgMood);
//       } else {
//         setAverageMood(null);  // Ensure the average mood is set to null if no data
//       }
//     //   const sumMood = recentLogs.reduce((acc, log) => acc + (log?.happinesslevel ?? 0), 0);
//     // //   const sumMood = recentLogs.reduce((acc, log) => acc + (log.happinesslevel ?? 0), 0);
//     //   const avgMood = sumMood / recentLogs.length;
//     //   setAverageMood(avgMood);
//     }
//   }, [data]);

//   const handleCreatePlaylist = async () => {
//     if (averageMood != null) {
//       try {
//         const response = await axios.post('/api/spotify/createPlaylist', { moodvalue: averageMood });
//         console.log('Playlist created:', response.data);
//         alert('Playlist created successfully!');
//       } catch (error) {
//         console.error('Failed to create playlist:', error);
//         alert('Failed to create playlist. Please try again later.');
//       }
//     } else {
//       alert('No mood data available to create playlist.');
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error loading mood logs!</p>;

//   return (
//     <Layout currentPage={currentPage}>
//         <div>
//             <h2>Generate a Playlist Based on Your Weekly Mood</h2>
//             {/* <button onClick={handleCreatePlaylist} disabled={averageMood === null}> */}
//             <button onClick={handleCreatePlaylist}>

//             Create Playlist
//             </button>
//         </div>
//     </Layout>
//   );
// };

// export default Recommendation;



// interface MoodLogProps {
//   email: string;
//   currentPage: string;
// }

// interface DailyMoodLogInputFromCalendar {
//   email: string;
//   logdatetime: string; // Assuming this is a string representation of a date
//   overallfeeling: string;
//   happinesslevel: number;
//   mostimpact: string;
// }

// const Recommendation: FC<MoodLogProps> = ({ email, currentPage }) => {
//   const [moodlogs, setMoodLogs] = useState<any[]>([]);
//   const [overallFeeling, setOverallFeeling] = useState('');
//   const [happyRangeValue, setHappyRangeValue] = useState(0.5);
//   const [mostImpact, setMostImpact] = useState('');

//   const { loading: moodLogsLoading, error: moodLogsError, data: moodLogsData } =
//     useQuery<getAllMoodLogs, getAllMoodLogsVariables>(
//       getAllMoodLogsQuery,
//       {
//         variables: { email: email },
//       }
//     );

//   const [createMoodLogMutationFn, { loading: mutationLoading, error: mutationError, data: mutationData }] =
//     useMutation<createMoodLog, createMoodLogVariables>(
//       createMoodLogMutation,
//       {
//         variables: {
//           moodlog: {
//             email: email,
//             logdatetime: new Date(),
//             overallfeeling: overallFeeling,
//             happinesslevel: happyRangeValue,
//             mostimpact: mostImpact,
//           }
//         },
//       }
//     );

//   // Load log data received from GraphQL query
//   useEffect(() => {
//     if (moodLogsData) {
//       setMoodLogs(prevMoodLogs => [...prevMoodLogs, moodLogsData]);
//       console.log('Mood log data from GQL query: ', moodLogsData);
//     }
//   }, [moodLogsData]);

//   // Handle calendar mood log change
//   const updateMoodLog = (updatedMoodLog: DailyMoodLogInputFromCalendar) => {
//     const moodLogInput = {
//       email: email,
//       logdatetime: updatedMoodLog.logdatetime,
//       overallfeeling: updatedMoodLog.overallfeeling,
//       happinesslevel: updatedMoodLog.happinesslevel,
//       mostimpact: updatedMoodLog.mostimpact,
//     }
//     // TO DO - use gql update function
//     console.log("moodLogInput passed from calendar component:", moodLogInput);
//   };

//   // Handle text change
//   const handleOverallFeelingChange = (text: string) => {
//     setOverallFeeling(text);
//   };

//   // handle range change
//   const handleHappyRangeChange = (value: number) => {
//     setHappyRangeValue(value); // Update the happy range value in the state
//   };

//   // handle most impact change
//   const handleMostImpactChange = (text: string) => {
//     setMostImpact(text); // Update the happy range value in the state
//   };

//   // handle submit
//   const handleSubmit = async (event: FormEvent) => {
//     event.preventDefault();

//     const moodLogInput = {
//       email: email,
//       logdatetime: new Date(),
//       overallfeeling: overallFeeling,
//       happinesslevel: happyRangeValue,
//       mostimpact: mostImpact,
//     }
//     console.log("Passing mood log input to backend: ", moodLogInput)

//     try {
//       // Before invoking the mutation function
//       console.log("Creating moodlog mutation function is about to be invoked");

//       // Invoke the mutation function
//       const { data } = await createMoodLogMutationFn();

//       // After the mutation function is invoked successfully with response
//       if (data && data.createMoodLog) {
//         setMoodLogs(prevMoodLogs => [...prevMoodLogs, data.createMoodLog]);
//         console.log('Mood log data updated: ', data.createMoodLog);
//       }
//     } catch (error) {
//       console.error("Error occurred while invoking creating moodlog mutation function:", error);
//     }
//   };

//   return (
//     <Layout currentPage={currentPage}>
//       <Calendar email={email} moodlogs={moodlogs} updateMoodLog={updateMoodLog} />
//       <OverallFeeling onOverallFeelingChange={handleOverallFeelingChange} />
//       <HappyRange onHappyRangeChange={handleHappyRangeChange} />
//       <MostImpact onMostImpactChange={handleMostImpactChange} />
//       <div className="d-flex justify-content-center mt-3">
//         <button className="btn btn-primary mb-2" onClick={handleSubmit}>Log my mood in!</button>
//       </div>
//     </Layout>
//   );
// }

// export default Recommendation;
