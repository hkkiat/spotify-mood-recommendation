require('dotenv').config({ path: './.env' });

const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { backendPort, frontendUrl } = require('./config');
const { connectToDb } = require('./db');
const resolvers = require('./resolvers/MainResolver');
const cors = require('cors'); // Import the cors middleware
const cookieParser = require('cookie-parser');
const { jwtSecret } = require('./config');
const jwt = require('jsonwebtoken');
const path = require('path');
const { router } = require('./resolvers/SpotifyResolver'); // Ensure path correctness
const { isCompositeType } = require('graphql');

const app = express();
app.use(express.static('public'));
app.use(express.json());
// new middleware to initialize database
let db; // Variable to hold DB instance

// new middleware to initialize database
// // Middleware to add db to each request
app.use((req, res, next) => {
  req.db = db; // Attach db to request object
  next();
});

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

    //console.log("Check date now", Date.now())
    //if (Date.now() >= decoded.exp) {
    //  res.clearCookie('_token');
    //  return res.status(403).send("Token has expired");
    //}


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

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schemas/travellerschema.graphql', 'utf-8'),
  resolvers,
  context: async ({ req, res }) => ({
    db: await connectToDb(),
    res,
    req
  }),
  formatError: error => {
    console.log(error);
    return error;
  },
});

//app.use(express.static('public'));
// Enable CORS for all routes
const corsOptions = {
  origin: 'http://localhost:3000', // This should match the URL of your frontend application
  credentials: true, // This is required if your frontend sends credentials like cookies
  optionsSuccessStatus: 200, // Some legacy browsers choke on status 204
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Cookie",
};
app.use(cors(corsOptions));
// Mount Spotify Routes
// app.use(express.json());
app.use(cookieParser()); // Make sure to use cookieParser before your custom middleware if you're using cookies
(async function () {
  try {
    await server.start();
    app.use('/graphql', verifyTokenMiddleware);
    // app.use('/api/spotify', verifyTokenMiddleware, router);
    app.use('/api/spotify', verifyTokenMiddleware, router);  // Applying the verifyTokenMiddleware to Spotify routes

    server.applyMiddleware({
      app,
      path: '/graphql',
      cors: false,
    });

  } catch (err) {
    console.log('ERROR:', err);
  }
})();


(async function () {
  try {
    db = await connectToDb();
    // await connectToDb();
    app.listen(backendPort, function () {
      console.log(`App started on port ${backendPort}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();

