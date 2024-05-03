// Express route handlers
router.get('/check-authorization', async (req, res) => {
    console.log("Check auth route - req.email:", req.email); // Log email to see if it's passed
    console.log("Check auth route - req.cookies:", req.cookies); // Additional cookie logging
    try {
        const userId = 'cometohk'; // This should ideally come from a secure source like session or authenticated request
        const accessToken = await getUserAccessToken(null, { userId }, { db: req.db });
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
  
  router.get('/auth-url', (req, res) => {
    console.log("Received cookies:", req.cookies);  // Log cookies to check the token presence
  
    console.log("authurl", req.userId);
  
    const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-private', 'playlist-modify-public', 'user-read-private'];
    const state = 'OPTIONAL_STATE';
    const authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({ url: authorizeUrl });
  });
  
  router.get('/callback', async (req, res) => {
    console.log("Received cookies:", req.cookies);  // Log cookies to check the token presence
  
    const { code, state } = req.query;
    if (!code) {
      console.log("No code received in the callback");
      return res.redirect('/#error');  // Use a proper UI route or error handling mechanism
    }
    try {
        // Use the authorize function directly here
        const authorizationResult = await authorize(null, { code }, { db: req.db });
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
    console.log("Received cookies:", req.cookies);  // Log cookies to check the token presence
    console.log('createplaylist: ', req.headers)
    const { userId, moodvalue } = req.body; // Ensure you securely authenticate and validate these inputs
    try {
        const playlist = await createPlaylistBasedOnFavorites(null, { userId, moodvalue }, { db: req.db });
        res.json(playlist);
    } catch (error) {
        res.status(500).send('Failed to create playlist');
    }
  });