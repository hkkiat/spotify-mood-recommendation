const spotifyApi = require('../spotifyConfig');
const express = require('express');
const router = express.Router();
const {
    getUserAccessToken,
    saveUserTokens,
    fetchTopTracksForArtists,
    fetchTracksAudioFeatures,
    fetchUserTopArtists,
    selectTracksBasedOnCriteria,
    createPlaylistBasedOnFavorites,
    formatPlaylistResponse,
    authorize,
    refreshAccessToken,
  } = require('../resolvers/SpotifyResolver.js');
  
// Express route handlers
router.get('/check-authorization', async (req, res) => {
    try {
        const userId = 'example_user_id'; // This should ideally come from a secure source like session or authenticated request
        const accessToken = await getUserAccessToken(null, { userId }, { db });
        res.json({ isAuthorized: !!accessToken });
    } catch (error) {
        res.status(500).send(error.message);
    }
  });
  
  router.get('/auth-url', (req, res) => {
    const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-private', 'playlist-modify-public', 'user-read-private'];
    const state = 'OPTIONAL_STATE';
    const authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({ url: authorizeUrl });
  });
  
  router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        // Use the authorize function directly here
        const authorizationResult = await authorize(null, { code }, { db });
        console.log("Authorization success:", authorizationResult);
        res.redirect('/#authorized');
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
    const { userId, moodvalue } = req.body; // Ensure you securely authenticate and validate these inputs
    try {
        const playlist = await createPlaylistBasedOnFavorites(null, { userId, moodvalue }, { db });
        res.json(playlist);
    } catch (error) {
        res.status(500).send('Failed to create playlist');
    }
  });
  