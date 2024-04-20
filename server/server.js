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



const verifyTokenMiddleware = (req, res, next) => {
  let token;
  console.log("Check request body", req.body)
  const bypassOperations = ["login", "register", "IntrospectionQuery"]
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
    req.userId = decoded.id;
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
    res
  }),
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();
//app.use(express.static('public'));
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Make sure to use cookieParser before your custom middleware if you're using cookies

(async function () {
  try {
    await server.start();
    app.use('/graphql', verifyTokenMiddleware);
    server.applyMiddleware({ app, path: '/graphql' });

  } catch (err) {
    console.log('ERROR:', err);
  }
})();


(async function () {
  try {
    await connectToDb();
    app.listen(backendPort, function () {
      console.log(`App started on port ${backendPort}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();

