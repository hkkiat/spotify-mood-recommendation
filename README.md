# Mood Tracker

Mood tracker to allow users to track their moods over time, and provide encouraging messages and music recommendations based on their moods.

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Authors](#authors)

## Key Features

There are 3 key features:
1. User Authentication
2. Mood Logging
3. Recommendation

View our mockup [here](https://www.figma.com/file/ZHsnruopY2JYJsaQqxQ0HS/1.-Mood-Log-Page?type=design&node-id=0%3A1&mode=design&t=Gb3aBS2kBKfZR4EE-1)

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
2. Mood logging - the main interface for mood logging allows you to:
- Select your current mood from the modal.
- Add additional description to your mood entry.
- View past entries and edit past entries by clicking on previous dates.

On the recommend page, the averaged mood, number of mood entries, highes and lowest mood are displayed for user's reference. User can also choose from a range of today, last 7 days and last 30 days to have a general view of the mood entries.

```
```

3. Recommend - The Spotify resolver connects to the Spotify API to using access token to fetch a list of the current user's favourite artists. It then fetches the top tracks of these artists to generate a recommended playlist based on the valence target, dancebility and energy target calculated from the previously logged mood entries. This recommended playlist will then be created as a new Spotify playlist under the name of MoodBooster Playlist. 

```
```

## License

MIT License

Copyright © [2024] [Chin Wee Nie, Clement Ng, Kiat Hui Khang]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Authors

Project contributed by Chin Wee Nie, Clement Ng, Kiat Hui Khang