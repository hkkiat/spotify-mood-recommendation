const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { backendPort } = require('./config');
const { connectToDb } = require('./db');
const resolvers = require('./resolvers/MainResolver');


const app = express();
app.use(express.static('public'));

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
    await connectToDb();
    app.listen(backendPort, function () {
      console.log(`App started on port ${backendPort}`);
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();
