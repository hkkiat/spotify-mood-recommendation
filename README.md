# Mood Tracker

Mood tracker to allow users to track their moods over time, and provide encouraging messages and music recommendations based on their moods.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Authors](#authors)

## Introduction

There are 3 key features:
1. User Authentication
2. Mood Logging
3. Recommendation

View our 
1. [Initial ideation](https://www.figma.com/file/ZHsnruopY2JYJsaQqxQ0HS/1.-Mood-Log-Page?type=design&node-id=0%3A1&mode=design&t=Gb3aBS2kBKfZR4EE-1)
2. [Database Schema](https://www.figma.com/file/ZHsnruopY2JYJsaQqxQ0HS/1.-Mood-Log-Page?type=design&node-id=92-120&mode=design&t=0oZOAOpWLjumyn9M-0)

## Installation

1. git clone the repo into your local machine
2. cd into the platform-docker directory of the local repo
3. Pull the latest MongoDB image by running ```$ docker pull mongodb/mongodb-community-server:latest ```
4. Run the MongoDB container using ```$ docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest```
3. Run ```$ docker-compose build frontend server```
4. Run ```$ docker-compose up -d server frontend```, this should start the frontend, server as well as MongoDB
5. Visit localhost:3000 to view the application.

## Usage
1. User authentication - When user first arrives at the web page, user will be prompted to input the email and password. User can also choose to register a new account. This feature is implemented using JWT token. To avoid having to verify the session token in every API call, we build the verification as a middleware of the express server. Redirection checker is also incorporated to redirect user away or to the login page depending on the presence of a valid session. User can logout of the application to remove the current session. 
```
const verifyTokenMiddleware = (req, res, next) => {
  let tokenBase64;
  console.log("Check request cookies", req.cookies)
  // console.log(req)

  const bypassOperations = ["Login", "Register", "IntrospectionQuery", "Logout"]
  const bypassPaths = ['/callback'];  // Ensure the path matches your route

  if (bypassPaths.includes(req.path)) {
    console.log(req.path)
    return next();
  }
  // Check if there's an operation name and it's a bypass operation
  else if (req.body && req.body.operationName && bypassOperations.includes(req.body.operationName)) {
    console.log('Bypassing token check for operation: ', req.body.operationName);
    return next();
  }
  else if (!req.body) {
    console.log('req no body: ', req.headers)
    return next();
  }

  if (req.cookies && req.cookies._token) {
    tokenBase64 = req.cookies._token;
  }

  if (!tokenBase64) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const token = Buffer.from(tokenBase64, 'base64').toString('ascii');
    const decoded = jwt.verify(token, jwtSecret);
    console.log("Decoded token:", decoded); // Verify the decoded token content
    req.userId = decoded.userId;
    req.email = decoded.email;

    console.log("Decoded token email: ", decoded.email);

    console.log("Email set in req:", req.email); // Check if email is correctly set
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  if (req.body) {
    if (req.body.operationName) {
      if (req.body.operationName === "DummyLoginCheck") {
        return res.status(302).send("Already logged in");
      }
    }
  }

  return next();
};
```
2. Mood logging - the main interface for mood logging was created using Material UI library, specifically [Date Calendar Component](https://mui.com/x/react-date-pickers/date-calendar/). It extracts the current month's moodlogs using today's date and displays a colored visual based on the overall happiness level for each day.

```
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
```

Mood logging allows the user to:
- View past daily happiness level through a monthly lens.
- Edit past mood log entries by clicking on past dates.
- Enter today's overall feeling, happiness level and most impacted category as a new moodlog.

3. Recommend - The Recommend function allows a user to generate a playlist based on their music taste as well as their moods using Spotify. The intent is to provide users with mood-suitable music to provide some comfort and lift their mooods. 

The Spotify resolver connects to the Spotify API using the OAuth 2.0 authorization framework, and obtains an access token after user provides the application with access to their data.

```
//Obtain access to user's spotify account, and stores access token in database
router.get('/auth-url', async (req, res) => {
  console.log('auth-url')
  const scopes = ['user-follow-read', 'user-top-read', 'playlist-modify-private', 'playlist-modify-public', 'user-read-private'];
  const user_email = req.email; // Assuming email is already set in req by previous middleware
  const token = crypto.randomBytes(20).toString('hex');
  const timestamp = new Date();

  // Store in the database
  await storeUserSession(null, {
    token,
    email: user_email,
    timestamp
  }, {db: req.db});
  const state = token;
  const authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);
  res.json({ url: authorizeUrl });
});
```

The application then fetches a list of the current user's top 20 favourite artists. In the case where users have less than 20 top artists, the remaining number is fetched from artists who feature in Spotify's top 50 global tracks. 5 artists are then randomly selected from a user's top 20 artist as seed artists for playlist generation.  A valence value for the playlist is then computed based on a user's logged moods (today, past 7 days or past 30 days), and songs will be selected for the playlist based on the valence value as well as similarity to the seed artists. The valence value is a attribute for Spotify tracks that represents the mood of the song, with a higher value representing better mood. Finally, the recommended playlist will then be created as a new Spotify playlist under the name of MoodBooster Playlist, which will appear in the Spotify web player on the page, as well as in a Spotify's user account. 

```
//frontend code
const createPlaylist = async () => {
    const storedMood = localStorage.getItem('averageMood'); 
    let moodValue;
    console.log('createplaylist', storedMood)
    const fromMoodLog = localStorage.getItem('fromMoodLog')
    if ((moodData.averageMood === null || moodData.numLogs === 0) && !localStorage.getItem('fromMoodLog'))
      {
      alert('No mood logs available for the selected period. Please log your mood for the selected time period first.');
      return;  // Exit the function to prevent further execution
    }
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
      alert('No sufficient mood data to create a playlist. Please log your moods for the selected time period first.'); 
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
}

//backend code
router.post('/create-playlist', async (req, res) => {
  const { moodvalue } = req.body; // Ensure you securely authenticate and validate these inputs
  console.log(moodvalue)
  const user_email  = req.email;
  console.log("route create-playlist: : ", user_email);
  try {
      const playlist = await createPlaylistBasedOnFavoritesFinal(null, { email: user_email, moodvalue: moodvalue }, { db: req.db });
      console.log('/createplaylist: ', playlist)
      res.json(playlist);
  } catch (error) {
      res.status(500).send('Failed to create playlist');
  }
});

async function createPlaylistBasedOnFavoritesFinal(_, { email, moodvalue }, { db }) {
  try {
    console.log('createplaylistfinal')

    const user = await db.collection('spotifyUser').findOne({ email: email });
    const accessToken = user.accessToken;
    const userId = user.userId;
    console.log(accessToken)
    console.log(userId)
    

    if (!accessToken) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    console.log("creating playlist", accessToken)
    spotifyApi.setAccessToken(accessToken);

    // fetch top 20 artists of user
    const topArtists = await fetchUserTopArtists(accessToken);
    console.log('topArtists: ', topArtists);
    
    // if less than 20 top artists, fill up with artists featuring in Spotify's global top 50 tracks list
    if (topArtists.length < 20) {
        const neededCount = 20 - topArtists.length;
        const globalTopArtists = await fetchGlobalTopArtists(accessToken, neededCount);
        topArtists = topArtists.concat(globalTopArtists);
    }
    
    const shuffledArtists = shuffleArray([...topArtists]); // Clone to avoid mutating the original array
    console.log('shuffledArtists: ', shuffledArtists);
    const seedArtists = shuffledArtists.filter(id => id !== null).slice(0, 5); // Remove any undefined IDs
    console.log('seedArtists: ', seedArtists);

    // fetch tracks for the playlist with valence value based on user's mood
    const trackIds = await fetchRecommendations(seedArtists, moodvalue, accessToken);
    console.log('trackIDs', trackIds)
    const selectedTracks = trackIds.map(id => ({ id: id }));
    console.log(selectedTracks)
    const playlist = await createSpotifyPlaylist(userId, "MoodBooster Playlist", selectedTracks, accessToken);
    console.log(playlist)
    return playlist;

  } catch (error) {
      console.error("Error creating playlist based on favorites:", error);
      throw new Error("Failed to create playlist.");
  }
}
```

## License

MIT License

Copyright © 2024

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Authors

Project contributed by Chin Wee Nie, Clement Ng, Kiat Hui Khang