// /**
//  * This is an example of a basic node.js script that performs
//  * the Authorization Code oAuth2 flow to authenticate against
//  * the Spotify Accounts.
//  *
//  * For more information, read
//  * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
//  */

// var express = require('express');
// var request = require('request');
// var crypto = require('crypto');
// var cors = require('cors');
// var querystring = require('querystring');
// var cookieParser = require('cookie-parser');

// var client_id = '8712d917e8bf4d6ba143e3093e5a86f1'; // your clientId
// var client_secret = '5da6bbfefc684d1ba4c19bd14b5e7299'; // Your secret
// var redirect_uri = 'http://localhost:3000/recommendation'; // Your redirect uri


// const generateRandomString = (length) => {
//   return crypto
//   .randomBytes(60)
//   .toString('hex')
//   .slice(0, length);
// }

// var stateKey = 'spotify_auth_state';

// var app = express();

// app.use(express.static(__dirname + '/public'))
//    .use(cors())
//    .use(cookieParser());

// app.get('/login', function(req, res) {

//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   // your application requests authorization
//   var scope = 'user-read-private user-read-email';
//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scope,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });

// app.get('/callback', function(req, res) {

//   // your application requests refresh and access tokens
//   // after checking the state parameter

//   var code = req.query.code || null;
//   var state = req.query.state || null;
//   var storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'content-type': 'application/x-www-form-urlencoded',
//         Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };

//     request.post(authOptions, function(error, response, body) {
//       if (!error && response.statusCode === 200) {

//         var access_token = body.access_token,
//             refresh_token = body.refresh_token;

//         var options = {
//           url: 'https://api.spotify.com/v1/me',
//           headers: { 'Authorization': 'Bearer ' + access_token },
//           json: true
//         };

//         // use the access token to access the Spotify Web API
//         request.get(options, function(error, response, body) {
//           console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.redirect('/#' +
//           querystring.stringify({
//             access_token: access_token,
//             refresh_token: refresh_token
//           }));
//       } else {
//         res.redirect('/#' +
//           querystring.stringify({
//             error: 'invalid_token'
//           }));
//       }
//     });
//   }
// });

// app.get('/refresh_token', function(req, res) {

//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 
//       'content-type': 'application/x-www-form-urlencoded',
//       'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) 
//     },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token,
//           refresh_token = body.refresh_token;
//       res.send({
//         'access_token': access_token,
//         'refresh_token': refresh_token
//       });
//     }
//   });
// });

// console.log('Listening on 8888');
// app.listen(8888);

// app.get('/refresh_token', function(req, res) {

//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//       'content-type': 'application/x-www-form-urlencoded',
//       'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//     },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token,
//           refresh_token = body.refresh_token;
//       res.send({
//         'access_token': access_token,
//         'refresh_token': refresh_token
//       });
//     }
//   });
// });

// // refresh tokens
// app.get('/refresh_token', function(req, res) {

//     var refresh_token = req.query.refresh_token;
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       headers: {
//         'content-type': 'application/x-www-form-urlencoded',
//         'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//       },
//       form: {
//         grant_type: 'refresh_token',
//         refresh_token: refresh_token
//       },
//       json: true
//     };
  
//     request.post(authOptions, function(error, response, body) {
//       if (!error && response.statusCode === 200) {
//         var access_token = body.access_token,
//             refresh_token = body.refresh_token;
//         res.send({
//           'access_token': access_token,
//           'refresh_token': refresh_token
//         });
//       }
//     });
//   });

// chatgpt
const express = require('express');
const fetch = require('node-fetch');
const queryString = require('query-string');
const crypto = require('crypto');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const SPOTIFY_CLIENT_ID = '8712d917e8bf4d6ba143e3093e5a86f1';
const SPOTIFY_CLIENT_SECRET = '5da6bbfefc684d1ba4c19bd14b5e7299';

const app = express();
const client_id = process.env.SPOTIFY_CLIENT_ID; // Ensure these are set in your environment
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = 'http://localhost:8000/callback';
const stateKey = 'spotify_auth_state';
const path = require('path');
// Moves up three directories from the current script's directory
const targetPath = path.join(__dirname, '../../../', 'public');

app.use(express.static(targetPath))
   .use(cors())
   .use(cookieParser());

const generateRandomString = (length) => crypto.randomBytes(length).toString('hex').slice(0, length);

// user login authetication
app.get('/login', function(req, res) {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email';
  const queryParams = queryString.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// handles callback after user authentication with spotify
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    return res.redirect('/#' +
      queryString.stringify({ error: 'state_mismatch' }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(`${client_id}:${client_secret}`).toString('base64'))
      },
      body: queryString.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      })
    };

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
      const data = await response.json();

      if (response.ok) {
        // Successful authentication, redirect with tokens in hash fragment
        res.redirect('/#' + queryString.stringify({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }));
      } else {
        // Failed authentication, redirect with error
        res.redirect('/#' + queryString.stringify({ error: 'invalid_token' }));
      }
    } catch (error) {
      res.redirect('/#' + queryString.stringify({ error: 'server_error' }));
    }
  }
});

app.get('/refresh_token', async (req, res) => {
  const refreshToken = req.query.refresh_token;
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(`${client_id}:${client_secret}`).toString('base64'))
    },
    body: queryString.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  };

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
    const data = await response.json();

    if (response.ok) {
      // Send new access token and refresh token (if returned) back to the client
      res.send({
        'access_token': data.access_token,
        'refresh_token': data.refresh_token || refreshToken // Refresh token may not be returned by Spotify
      });
    } else {
      res.send({ error: 'Could not refresh token' });
    }
  } catch (error) {
    res.send({ error: 'Failed to refresh token' });
  }
});

app.listen(8000, () => console.log('Server running on port 8000'));
