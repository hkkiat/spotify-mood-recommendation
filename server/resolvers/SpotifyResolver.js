// spotifyAuth.js
// require('dotenv').config({ path: '../spotify.env' });

const fetch = require('node-fetch');
// const SpotifyWebApi = require('spotify-web-api-node');

// // Set up the Spotify API client
// const spotifyApi = new SpotifyWebApi({
//   clientId: process.env.SPOTIFY_CLIENT_ID,
//   clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//   redirectUri: process.env.REDIRECT_URI, 

// });

const spotifyApi = require('../spotifyConfig');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Get user token for the first time and store in db
// Save user token to db
async function saveUserTokens(_, {email, userId, accessToken, refreshToken, expiresAt}, {db}) {
  // console.log(accessToken)
  // console.log(refreshToken)
  // console.log(expiresAt)
  await db.collection('spotifyUser').updateOne(
    { email },
    { $set: { accessToken, refreshToken, expiresAt, userId } },
    { upsert: true }
  );
}

// Get user token from db 
async function getUserAccessToken(_, { email }, { db }) {
  console.log('getuseraccessemail: ', email)
  const userRecord = await db.collection('spotifyUser').findOne({ email: email });
  console.log('getuseraccessrecord: ', userRecord)
  if (!userRecord) {
    return null;
  }

  const { accessToken, expiresAt, refreshToken, userId } = userRecord;
    
  // Check if the access token has expired
  if (new Date() > new Date(expiresAt)) {
    // Access token has expired, refresh it
    const refreshedToken = await refreshAccessToken(_, { email }, { db });
    console.log(refreshedToken)
    console.log('returning refreshed token')
    return refreshedToken.accessToken; // Assuming refreshAccessToken updates the db and returns { accessToken: newAccessToken }
    // return await refreshAccessToken(_, { userId }, { db }).accessToken;
  } else {
    // Access token is still valid
    console.log('returning access token');
    return accessToken;
  }
}

// //get spotify user id
// async function getSpotifyUserId(accessToken) {
//   const userRecord = await db.collection('spotifyUser').findOne({ email: email });
  
//   if (!userRecord) {
//     return null;
//   }
  
//   return userRecord.userId
  // const response = await fetch('https://api.spotify.com/v1/me', {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`
  //   }
  // });

  // const data = await response.json();
  // if (!response.ok) {
  //   throw new Error(data.error || 'Failed to fetch user data');
  // }
  // return data.id; // The Spotify user ID
// }

// Helper Function: Fetch top artists of a user or top global artists if none are found
async function fetchUserTopArtists(accessToken) {
  spotifyApi.setAccessToken(accessToken);
  const result = await spotifyApi.getMyTopArtists({ limit: 50 });
  return result.body.items.map(artist => artist.id);
}

// Helper Function: Fetch top tracks for each artist and return an array of track IDs
async function fetchTopTracksForArtists(artistIds, accessToken) {
  spotifyApi.setAccessToken(accessToken);
  let trackIds = [];

  for (let artistId of artistIds) {
    const result = await spotifyApi.getArtistTopTracks(artistId, 'from_token');
    trackIds.push(...result.body.tracks.map(track => track.id));
  }

  return trackIds;
}

// Helper Function: Fetch audio features for the tracks
async function fetchTracksAudioFeatures(trackIds, accessToken) {
  spotifyApi.setAccessToken(accessToken);
  const MAX_TRACKS_PER_REQUEST = 50; // Adjust based on Spotify's limits
  let allAudioFeatures = [];

  // Split trackIds into batches
  for (let i = 0; i < trackIds.length; i += MAX_TRACKS_PER_REQUEST) {
    const batch = trackIds.slice(i, i + MAX_TRACKS_PER_REQUEST);
    const result = await spotifyApi.getAudioFeaturesForTracks(batch);
    allAudioFeatures.push(...result.body.audio_features);
  }

  return allAudioFeatures;
}

// Helper Function: Filter and sort tracks based on mood criteria
function selectTracksBasedOnCriteria(tracksWithFeatures, moodvalue) {
  const tolerance = 0.2; // Tolerance for matching mood criteria
  // Calculate target features based on moodvalue
  let valenceTarget, danceabilityTarget, energyTarget;  // Declare variables outside the if-else blocks

  if (moodvalue > 0.60) {
    valenceTarget = 0.60;  
    danceabilityTarget = 0.60;
    energyTarget = 0.60;
  } else {
    valenceTarget = moodvalue;  
    danceabilityTarget = moodvalue + 0.1;
    energyTarget = moodvalue + 0.1;
    console.log("valenceTarget: ", valenceTarget)
    console.log("danceabilityTarget", danceabilityTarget)
    console.log("energyTarget", energyTarget)
  }
  // Filter tracks within a tolerance range of the target mood features
  let filteredTracks = tracksWithFeatures.filter(track => 
    track && // Ensure the track object itself is not null
    track.valence !== undefined && 
    track.danceability !== undefined && 
    track.energy !== undefined &&
    track.valence >= valenceTarget && track.valence <= 1.0 
    // track.danceability >= danceabilityTarget - tolerance && track.danceability <= 1.0 &&
    // track.energy >= energyTarget - tolerance && track.energy <= 1.0
  );
  console.log("Tracks before filtering:", tracksWithFeatures.length);
  console.log("Filtered tracks:", filteredTracks.length);
  // Shuffle the filtered tracks to add randomness
  shuffleArray(filteredTracks);

  // Select up to 12 tracks after shuffling
  return filteredTracks.slice(0, 10);
}

// Utility function to shuffle an array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Helper Function: Create a Spotify playlist and add selected tracks
async function createSpotifyPlaylist(userId, playlistName, selectedTracks, accessToken) {
  try {
      // Create a new playlist
      const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
      const createPlaylistResponse = await fetch(createPlaylistUrl, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              name: playlistName,
              public: false
          })
      });
      const createPlaylistResult = await createPlaylistResponse.json();

      if (!createPlaylistResult || !createPlaylistResult.id) {
          console.error('Failed to create playlist. Response:', createPlaylistResult);
          throw new Error('Failed to create playlist.');
      }

      // Add tracks to the newly created playlist
      const playlistId = createPlaylistResult.id;
      const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      const trackUris = selectedTracks.map(track => `spotify:track:${track.id}`);
      const addTracksResponse = await fetch(addTracksUrl, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: trackUris })
      });
      const addTracksResult = await addTracksResponse.json();

      // Check for errors in adding tracks
      if (!addTracksResult || addTracksResult.error) {
          console.error('Failed to add tracks to playlist. Response:', addTracksResult);
          throw new Error('Failed to add tracks to playlist.');
      }

      // Return the created playlist information
      return createPlaylistResult;
  } catch (error) {
      console.error('Error creating or adding tracks to playlist:', error);
      throw new Error('Failed to create or add tracks to the playlist.');
  }
}
//Helper function to format the response from Spotify API to match the GraphQL Schema
function formatPlaylistResponse(playlist, selectedTracks) {
  return {
    id: playlist.id,
    name: playlist.name,
    tracks: selectedTracks.filter(track => track.name).map(track => ({
      id: track.id,
      name: track.name || "Unnamed Track", // Provide a default name if missing
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })),
    }))
  };
}

// ** Resolvers ** //

// Get user token for the first time and store in db
async function authorize(_, { code, email }, { db }) {
  console.log('authorizeemail: ', email)
  console.log('authorizecode: ', code)
  const data = await spotifyApi.authorizationCodeGrant(code);
  const { access_token, refresh_token, expires_in } = data.body;

  // Set the access token on the API object to use it in later calls
  spotifyApi.setAccessToken(access_token);

  const me = await spotifyApi.getMe();
  const user_id = me.body.id;
  const expires_at = new Date(new Date().getTime() + expires_in * 1000);
  // console.log(userId, access_token, refresh_token, expires_at)

  await saveUserTokens(null, {email, userId: user_id, accessToken: access_token, refreshToken: refresh_token, expiresAt: expires_at}, {db});

  return {
    email,
    userId: user_id,
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: expires_at,
  };
}

// Refresh user token and store in db
async function refreshAccessToken(_, { email }, { db }) {
  // Retrieve the user's current refreshToken from the database
  const user = await db.collection('spotifyUser').findOne({ email: email });
  if (!user) {
    throw new Error('User not found');
  }

  // Set the credentials to be able to refresh the token
  spotifyApi.setRefreshToken(user.refreshToken);

  try {
    // Refresh the token
    const data = await spotifyApi.refreshAccessToken();
    const { access_token, expires_in } = data.body;
    const user_id = userId;

    // Calculate the new expiration date
    const expires_at = new Date(new Date().getTime() + expires_in * 1000);

    // Use the existing saveUserTokens function to save the new tokens
    await saveUserTokens(null, { email, userId: user_id, accessToken: access_token, refreshToken: user.refreshToken, expiresAt: expires_at }, { db });

    return {accessToken: access_token};
    // return access_token;
    // return {
    //   accessToken: access_token,
    //   expiresAt: expires_at,
    // };
  } catch (error) {
    console.error(`Error refreshing access token for user ${userId}:`, error);
    throw new Error('Failed to refresh Spotify access token');
  }
}

// Create a playlist based on mood

async function createPlaylistBasedOnFavorites(_, { email, moodvalue }, { db }) {
  try {
    console.log('createPlaylist: ', email)
    console.log('createplaylistmood: ', moodvalue)
    const user = await db.collection('spotifyUser').findOne({ email: email });
    console.log(user)
    const accessToken = user.accessToken;
    const userId = user.userId;
    // const accessToken = await getUserAccessToken(null, {userId}, { db });
    if (!accessToken) {
      throw new Error(`User with ID ${userId} not found.`);
    }
    console.log("creating playlist", accessToken)
    spotifyApi.setAccessToken(accessToken);

    const topArtists = await fetchUserTopArtists(accessToken);
    // console.log('topArtist')
    // console.log(topArtists)
    let trackIds = await fetchTopTracksForArtists(topArtists, accessToken);
    // console.log('trackIds')
    // console.log(trackIds)
    let tracksWithFeatures = await fetchTracksAudioFeatures(trackIds, accessToken);
    // console.log('tracksWithFeatures')
    // Filter and sort tracks based on criteria
    const selectedTracks = selectTracksBasedOnCriteria(tracksWithFeatures, moodvalue);
    // console.log('selectedTracks')
    // console.log(selectedTracks)
    // Create playlist and add tracks
    const playlist = await createSpotifyPlaylist(userId, "Moodlog Playlist", selectedTracks, accessToken);
    // console.log('playlist')
    console.log(playlist)
    return formatPlaylistResponse(playlist, selectedTracks);
  } catch (error) {
    console.error("Error creating playlist based on favorites:", error);
    throw new Error("Failed to create playlist.");
  }
}

async function storeUserSession(_, { token, email, timestamp }, {db}) {
  try {
    // console.log('storeusersession')
    // console.log(token, email, timestamp)
    // console.log(db)
    await db.collection('userSession').updateOne(
      { token },
      { $set: { email, timestamp, isActive: true } },
      { upsert: true }
    );
    // const session = new db.UserSession({
    //   token,
    //   email,
    //   timestamp,
    //   isActive: true
    // });
    // await session.save();
    console.log('finish save')
    // return session;
  } catch (error) {
    throw new Error('Failed to store user session: ' + error.message);
  }
}

async function retrieveUserSession(_, {token}, {db}) {
  try {
    console.log('retrieveusersession')
    console.log(token)
    console.log(db)
    const session = await db.collection('userSession').findOne({ token: token });
    console.log(session)
    // const session = await db.UserSession.findOne({
    //   token: token,
    //   isActive: true
    // });
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  } catch (error) {
    throw new Error('Failed to retrieve user session: ' + error.message);
  }
}

// Express route handlers
router.get('/check-authorization', async (req, res) => {
  try {
      // const userId = 'cometohk'; // This should ideally come from a secure source like session or authenticated request
      const user_email = req.email;
      // console.log({
      //   headers: req.headers,
      //   cookies: req.cookies,
      //   session: req.session,
      //   db: req.db,
      //   email: req.email
      // });      
      // const user_email = req.email; // Assuming email is already set in req by previous middleware
      // // console.log('user-email: ', user_email)
      // const token = crypto.randomBytes(20).toString('hex');
      // // console.log('token: ', token)
      // const timestamp = new Date();
      // // console.log('timestamp: ', timestamp)
      // // console.log(req.db)

      // // Store in the database
      // await storeUserSession(null, {
      //   token,
      //   email: user_email,
      //   timestamp
      // }, {db: req.db});

      console.log('check-auth: ', user_email);
      const accessToken = await getUserAccessToken(null, { email: user_email }, { db: req.db });
      console.log(accessToken);
      // const userId = await getSpotifyUserId(null, { user_email }, { db: req.db })  
      if (!accessToken) {
        // User not found or no valid token available
        res.json({ isAuthorized: false });
      } else {
        // User found and token is valid
        res.json({ isAuthorized: true });
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});

router.get('/auth-url', async (req, res) => {
  console.log('auth-url')
  const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-private', 'playlist-modify-public', 'user-read-private'];
  const user_email = req.email; // Assuming email is already set in req by previous middleware
      // console.log('user-email: ', user_email)
  const token = crypto.randomBytes(20).toString('hex');
  // console.log('token: ', token)
  const timestamp = new Date();
  // console.log('timestamp: ', timestamp)
  // console.log(req.db)

  // Store in the database
  await storeUserSession(null, {
    token,
    email: user_email,
    timestamp
  }, {db: req.db});
  // const userData = await retrieveUserSession(null, {token}, {db: req.db});
  // console.log('auth userdata: ', userData)
  const state = token;
  const authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
  res.json({ url: authorizeUrl });
});

router.get('/callback', async (req, res) => {
  console.log(req.db)
  console.log(req.query)
  const { code, state } = req.query;
    if (!code) {
    console.log("No code received in the callback");
    return res.redirect('/#error');  // Use a proper UI route or error handling mechanism
  }
  console.log('state received: ', state);
  try {
    const userData = await retrieveUserSession(null, {token: state}, {db: req.db});
    if (!userData) {
      return res.status(404).send('Session not found.');
    }
    const user_email = userData.email
    console.log('callback: ', user_email)
    // Use the authorize function directly here
    const authorizationResult = await authorize(null, { code, email: user_email }, { db: req.db });
    console.log("Authorization success:", authorizationResult);
    res.redirect('http://localhost:3000/recommend?authorized=true');
  } catch (error) {
    console.error('Error during authorization:', error);
    res.redirect('/#error');
}
});
// router.get('/callback', async (req, res) => {
//   const { code } = req.query;
//   try {
//       const data = await spotifyApi.authorizationCodeGrant(code);
//       console.log("Authorization success:", data.body);
//       res.redirect('/#authorized');
//   } catch (error) {
//       console.error('Error during authorization:', error);
//       res.redirect('/#error');
//   }
// });

router.post('/create-playlist', async (req, res) => {
  const { moodvalue } = req.body; // Ensure you securely authenticate and validate these inputs
  console.log(moodvalue)
  const user_email  = req.email;
  console.log("route create-playlist: : ", user_email);
  try {
      const playlist = await createPlaylistBasedOnFavorites(null, { email: user_email, moodvalue: moodvalue }, { db: req.db });
      res.json(playlist);
  } catch (error) {
      res.status(500).send('Failed to create playlist');
  }
});

// Export all your handlers and functions
module.exports = {
  //for spotifyRoutes
  getUserAccessToken,
  saveUserTokens,
  fetchTopTracksForArtists,
  fetchTracksAudioFeatures,
  fetchUserTopArtists,
  selectTracksBasedOnCriteria,
  formatPlaylistResponse,
  authorize,
  refreshAccessToken,
  createPlaylistBasedOnFavorites,
  retrieveUserSession,
  storeUserSession,
  router  // Export the router for use in server.js or wherever needed
};


// // spotifyAuth.js
// // require('dotenv').config({ path: '../spotify.env' });

// const fetch = require('node-fetch');
// // const SpotifyWebApi = require('spotify-web-api-node');

// // // Set up the Spotify API client
// // const spotifyApi = new SpotifyWebApi({
// //   clientId: process.env.SPOTIFY_CLIENT_ID,
// //   clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
// //   redirectUri: process.env.REDIRECT_URI, 

// // });

// const spotifyApi = require('../spotifyConfig');
// const express = require('express');
// const router = express.Router();

// // Get user token for the first time and store in db
// // Save user token to db
// async function saveUserTokens(_, {userId, accessToken, refreshToken, expiresAt}, {db}) {
//   // console.log(accessToken)
//   // console.log(refreshToken)
//   // console.log(expiresAt)
//   await db.collection('spotifyUser').updateOne(
//     { userId },
//     { $set: { accessToken, refreshToken, expiresAt } },
//     { upsert: true }
//   );
// }

// // Get user token from db 
// async function getUserAccessToken(_, {userId}, { db }) {
//   const userRecord = await db.collection('spotifyUser').findOne({ userId: userId });
  
//   if (!userRecord) {
//     return null;
//   }

//   const { accessToken, expiresAt, refreshToken } = userRecord;
  
//   // Check if the access token has expired
//   if (new Date() > new Date(expiresAt)) {
//     // Access token has expired, refresh it
//     const refreshedToken = await refreshAccessToken(_, { userId }, { db });
//     return refreshedToken.accessToken; // Assuming refreshAccessToken updates the db and returns { accessToken: newAccessToken }
//     // return await refreshAccessToken(_, { userId }, { db }).accessToken;
//   } else {
//     // Access token is still valid
//     return accessToken;
//   }
// }

// //get spotify user id
// async function fetchSpotifyUserId(accessToken) {
//   const response = await fetch('https://api.spotify.com/v1/me', {
//     headers: {
//       'Authorization': `Bearer ${accessToken}`
//     }
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     throw new Error(data.error || 'Failed to fetch user data');
//   }
//   return data.id; // The Spotify user ID
// }

// // Helper Function: Fetch top artists of a user or top global artists if none are found
// async function fetchUserTopArtists(accessToken) {
//   spotifyApi.setAccessToken(accessToken);
//   const result = await spotifyApi.getMyTopArtists({ limit: 50 });
//   return result.body.items.map(artist => artist.id);
// }

// // Helper Function: Fetch top tracks for each artist and return an array of track IDs
// async function fetchTopTracksForArtists(artistIds, accessToken) {
//   spotifyApi.setAccessToken(accessToken);
//   let trackIds = [];

//   for (let artistId of artistIds) {
//     const result = await spotifyApi.getArtistTopTracks(artistId, 'from_token');
//     trackIds.push(...result.body.tracks.map(track => track.id));
//   }

//   return trackIds;
// }

// // Helper Function: Fetch audio features for the tracks
// async function fetchTracksAudioFeatures(trackIds, accessToken) {
//   spotifyApi.setAccessToken(accessToken);
//   const MAX_TRACKS_PER_REQUEST = 50; // Adjust based on Spotify's limits
//   let allAudioFeatures = [];

//   // Split trackIds into batches
//   for (let i = 0; i < trackIds.length; i += MAX_TRACKS_PER_REQUEST) {
//     const batch = trackIds.slice(i, i + MAX_TRACKS_PER_REQUEST);
//     const result = await spotifyApi.getAudioFeaturesForTracks(batch);
//     allAudioFeatures.push(...result.body.audio_features);
//   }

//   return allAudioFeatures;
// }

// // Helper Function: Filter and sort tracks based on mood criteria
// function selectTracksBasedOnCriteria(tracksWithFeatures, moodvalue) {
//   const tolerance = 0.15; // Tolerance for matching mood criteria
//   // Calculate target features based on moodvalue
//   const valenceTarget = moodvalue;  
//   const danceabilityTarget = Math.min(moodvalue + 0.25, 1.0);
//   const energyTarget = Math.min(moodvalue + 0.25, 1.0);
//   console.log("valenceTarget: ", valenceTarget)
//   console.log("danceabilityTarget", danceabilityTarget)
//   console.log("energyTarget", energyTarget)
//   // Filter tracks within a tolerance range of the target mood features
//   let filteredTracks = tracksWithFeatures.filter(track => 
//     track && // Ensure the track object itself is not null
//     track.valence !== undefined && 
//     track.danceability !== undefined && 
//     track.energy !== undefined &&
//     track.valence >= valenceTarget - tolerance && track.valence <= 1.0 &&
//     track.danceability >= danceabilityTarget - tolerance && track.danceability <= 1.0 &&
//     track.energy >= energyTarget - tolerance && track.energy <= 1.0
//   );
//   console.log("Tracks before filtering:", tracksWithFeatures.length);
//   console.log("Filtered tracks:", filteredTracks.length);
//   // Shuffle the filtered tracks to add randomness
//   shuffleArray(filteredTracks);

//   // Select up to 12 tracks after shuffling
//   return filteredTracks.slice(0, 12);
// }

// // Utility function to shuffle an array in place
// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]]; // Swap elements
//   }
// }

// // Helper Function: Create a Spotify playlist and add selected tracks
// async function createSpotifyPlaylist(userId, playlistName, selectedTracks, accessToken) {
//   try {
//       // Create a new playlist
//       const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
//       const createPlaylistResponse = await fetch(createPlaylistUrl, {
//           method: 'POST',
//           headers: {
//               'Authorization': `Bearer ${accessToken}`,
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//               name: playlistName,
//               public: false
//           })
//       });
//       const createPlaylistResult = await createPlaylistResponse.json();

//       if (!createPlaylistResult || !createPlaylistResult.id) {
//           console.error('Failed to create playlist. Response:', createPlaylistResult);
//           throw new Error('Failed to create playlist.');
//       }

//       // Add tracks to the newly created playlist
//       const playlistId = createPlaylistResult.id;
//       const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
//       const trackUris = selectedTracks.map(track => `spotify:track:${track.id}`);
//       const addTracksResponse = await fetch(addTracksUrl, {
//           method: 'POST',
//           headers: {
//               'Authorization': `Bearer ${accessToken}`,
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ uris: trackUris })
//       });
//       const addTracksResult = await addTracksResponse.json();

//       // Check for errors in adding tracks
//       if (!addTracksResult || addTracksResult.error) {
//           console.error('Failed to add tracks to playlist. Response:', addTracksResult);
//           throw new Error('Failed to add tracks to playlist.');
//       }

//       // Return the created playlist information
//       return createPlaylistResult;
//   } catch (error) {
//       console.error('Error creating or adding tracks to playlist:', error);
//       throw new Error('Failed to create or add tracks to the playlist.');
//   }
// }
// //Helper function to format the response from Spotify API to match the GraphQL Schema
// function formatPlaylistResponse(playlist, selectedTracks) {
//   return {
//     id: playlist.id,
//     name: playlist.name,
//     tracks: selectedTracks.filter(track => track.name).map(track => ({
//       id: track.id,
//       name: track.name || "Unnamed Track", // Provide a default name if missing
//       artists: track.artists.map(artist => ({
//         id: artist.id,
//         name: artist.name
//       })),
//     }))
//   };
// }

// // ** Resolvers ** //

// // Get user token for the first time and store in db
// async function authorize(_, { code }, { db }) {
//   const data = await spotifyApi.authorizationCodeGrant(code);
//   const { access_token, refresh_token, expires_in } = data.body;

//   // Set the access token on the API object to use it in later calls
//   spotifyApi.setAccessToken(access_token);

//   const me = await spotifyApi.getMe();
//   const userId = me.body.id;
//   const expires_at = new Date(new Date().getTime() + expires_in * 1000);
//   // console.log(userId, access_token, refresh_token, expires_at)

//   await saveUserTokens(null, {userId, accessToken: access_token, refreshToken: refresh_token, expiresAt: expires_at}, {db});

//   return {
//     userId,
//     accessToken: access_token,
//     refreshToken: refresh_token,
//     expiresAt: expires_at,
//   };
// }

// // Refresh user token and store in db
// async function refreshAccessToken(_, { userId }, { db }) {
//   // Retrieve the user's current refreshToken from the database
//   const user = await db.collection('spotifyUser').findOne({ userId: userId });
//   if (!user) {
//     throw new Error('User not found');
//   }

//   // Set the credentials to be able to refresh the token
//   spotifyApi.setRefreshToken(user.refreshToken);

//   try {
//     // Refresh the token
//     const data = await spotifyApi.refreshAccessToken();
//     const { access_token, expires_in } = data.body;

//     // Calculate the new expiration date
//     const expires_at = new Date(new Date().getTime() + expires_in * 1000);

//     // Use the existing saveUserTokens function to save the new tokens
//     await saveUserTokens(null, { userId, accessToken: access_token, refreshToken: user.refreshToken, expiresAt: expires_at }, { db });

//     return {accessToken: access_token};
//     // return access_token;
//     // return {
//     //   accessToken: access_token,
//     //   expiresAt: expires_at,
//     // };
//   } catch (error) {
//     console.error(`Error refreshing access token for user ${userId}:`, error);
//     throw new Error('Failed to refresh Spotify access token');
//   }
// }

// // Create a playlist based on mood

// async function createPlaylistBasedOnFavorites(_, { userId, moodvalue }, { db }) {
//   try {
//     const accessToken = await getUserAccessToken(null, {userId}, { db });
//     if (!accessToken) {
//       throw new Error(`User with ID ${userId} not found.`);
//     }
//     console.log("creating playlist", accessToken)
//     spotifyApi.setAccessToken(accessToken);

//     const topArtists = await fetchUserTopArtists(accessToken);
//     // console.log('topArtist')
//     // console.log(topArtists)
//     let trackIds = await fetchTopTracksForArtists(topArtists, accessToken);
//     // console.log('trackIds')
//     // console.log(trackIds)
//     let tracksWithFeatures = await fetchTracksAudioFeatures(trackIds, accessToken);
//     // console.log('tracksWithFeatures')
//     console.log(tracksWithFeatures[-1])
//     // Filter and sort tracks based on criteria
//     const selectedTracks = selectTracksBasedOnCriteria(tracksWithFeatures, moodvalue);
//     // console.log('selectedTracks')
//     // console.log(selectedTracks)
//     // Create playlist and add tracks
//     const playlist = await createSpotifyPlaylist(userId, "Generated Playlist", selectedTracks, accessToken);
//     // console.log('playlist')
//     console.log(playlist)
//     return formatPlaylistResponse(playlist, selectedTracks);
//   } catch (error) {
//     console.error("Error creating playlist based on favorites:", error);
//     throw new Error("Failed to create playlist.");
//   }
// }

// // Express route handlers
// router.get('/check-authorization', async (req, res) => {
//   console.log("Check auth route - req.email:", req.email); // Log email to see if it's passed
//   console.log("Check auth route - req.cookies:", req.cookies); // Additional cookie logging
//   try {
//       const userId = 'cometohk'; // This should ideally come from a secure source like session or authenticated request
//       const accessToken = await getUserAccessToken(null, { userId }, { db: req.db });
//       if (!accessToken) {
//         // User not found or no valid token available
//         res.json({ isAuthorized: false });
//       } else {
//         // User found and token is valid
//         res.json({ isAuthorized: true });
//       }
//   } catch (error) {
//       res.status(500).send(error.message);
//   }
// });

// router.get('/auth-url', (req, res) => {
//   console.log("Authurl Received cookies:", req.cookies);  // Log cookies to check the token presence
//   console.log("authurlemail", req.email);


//   const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-private', 'playlist-modify-public', 'user-read-private'];
//   const state = 'OPTIONAL_STATE';
//   const authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
//   console.log(authorizeUrl);
//   res.json({ url: authorizeUrl });
// });

// router.get('/callback', async (req, res) => {
//   console.log("Callback Received cookies:", req.cookies);  // Log cookies to check the token presence

//   const { code, state } = req.query;
//   if (!code) {
//     console.log("No code received in the callback");
//     return res.redirect('/#error');  // Use a proper UI route or error handling mechanism
//   }
//   try {
//       // Use the authorize function directly here
//       const authorizationResult = await authorize(null, { code }, { db: req.db });
//       console.log("Authorization success:", authorizationResult);
//       res.redirect('http://localhost:3000/recommend?authorized=true');
//   } catch (error) {
//       console.error('Error during authorization:', error);
//       res.redirect('/#error');
//   }
// });
// // router.get('/callback', async (req, res) => {
// //   const { code } = req.query;
// //   try {
// //       const data = await spotifyApi.authorizationCodeGrant(code);
// //       console.log("Authorization success:", data.body);
// //       res.redirect('/#authorized');
// //   } catch (error) {
// //       console.error('Error during authorization:', error);
// //       res.redirect('/#error');
// //   }
// // });

// router.post('/create-playlist', async (req, res) => {
//   console.log("Received cookies:", req.cookies);  // Log cookies to check the token presence
//   console.log('createplaylist: ', req.headers)
//   const { userId, moodvalue } = req.body; // Ensure you securely authenticate and validate these inputs
//   try {
//       const playlist = await createPlaylistBasedOnFavorites(null, { userId, moodvalue }, { db: req.db });
//       res.json(playlist);
//   } catch (error) {
//       res.status(500).send('Failed to create playlist');
//   }
// });

// // Export all your handlers and functions
// module.exports = {
//   //for spotifyRoutes
//   getUserAccessToken,
//   saveUserTokens,
//   fetchTopTracksForArtists,
//   fetchTracksAudioFeatures,
//   fetchUserTopArtists,
//   selectTracksBasedOnCriteria,
//   formatPlaylistResponse,
//   authorize,
//   refreshAccessToken,
//   createPlaylistBasedOnFavorites,
//   router  // Export the router for use in server.js or wherever needed
// };
