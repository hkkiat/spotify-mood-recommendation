require('dotenv').config({ path: './.env' });

const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { backendPort } = require('./config');
const { connectToDb } = require('./db');
const resolvers = require('./resolvers/MainResolver');
const cors = require('cors'); // Import the cors middleware
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

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schemas/travellerschema.graphql', 'utf-8'),
  resolvers,
  context: async () => ({
    db: await connectToDb(),
  }),
  formatError: error => {
    console.log(error);
    return error;
  },
});

// Enable CORS for all routes
app.use(cors());

// Mount Spotify Routes
app.use('/api/spotify', router); 

(async function() {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

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

