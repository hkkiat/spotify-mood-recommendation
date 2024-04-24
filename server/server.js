require('dotenv').config({ path: './.env' });

const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { backendPort } = require('./config');
const { connectToDb } = require('./db');
const resolvers = require('./resolvers/MainResolver');
const cors = require('cors'); // Import the cors middleware
const cookieParser = require('cookie-parser');
const { jwtSecret } = require('./config');
const jwt = require('jsonwebtoken');
const path = require('path');
const { router } = require('./resolvers/SpotifyResolver'); // Ensure path correctness

const app = express();
app.use(express.static('public'));
app.use(express.json());
// new middleware to initialize database
let db; // Variable to hold DB instance

// Middleware to add db to each request
app.use((req, res, next) => {
  req.db = db; // Attach db to request object
  next();
});
// new middleware to initialize database


const verifyTokenMiddleware = (req, res, next) => {
  let token;
  console.log("Check request cookies", req.cookies)

  const bypassOperations = ["Login", "Register", "IntrospectionQuery"]
  if (req.body) {
    if (req.body.operationName) {
      if (bypassOperations.includes(req.body.operationName)) {
        return next();
      }
    } else {
      // We skip authorization for the first handshake when there is no req body
      return next()
    }
  }

  if (req.cookies && req.cookies._token) {
    token = req.cookies._token;
  }

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    req.email = decoded.email;
  } catch (err) {
    return res.status(401).send("Invalid Token");
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
app.use('/api/spotify', router); 
app.use(express.json());
app.use(cookieParser()); // Make sure to use cookieParser before your custom middleware if you're using cookies

(async function () {
  try {
    await server.start();
    app.use('/graphql', verifyTokenMiddleware);
    server.applyMiddleware({
      app,
      path: '/graphql',
      cors: false,
    });
    //app.use((err, req, res, next) => {
    //  // Ensure CORS headers are set for error responses
    //  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    //  res.header('Access-Control-Allow-Credentials', 'true');
    //  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    //  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    //});
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

