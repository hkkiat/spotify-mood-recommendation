const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

//Resolver1: Query
async function listTravellers()
{
  /*Q2: Write code to talk to DB and read the list of travellers
   * */
  result = await db.collection('travellers').find().toArray()
  console.log(result)
  return result

  /*End of Q2*/
}

async function findBlackListTraveller(_, { travellername, travellerphone }) {
  /*Q4: Write code to talk to DB and find if travellername exists in blacklist
   * */
  console.log("Checking within blacklist for...", travellername, travellerphone)
  if (travellername) {
    var nameFound = await db.collection('blacklist').findOne({ name: travellername })
    console.log("Is name found?", nameFound)
  }

  if (travellerphone) {
    var phoneFound = await db.collection('blacklist').findOne({ phone: travellerphone })
    console.log("Is phone found?", phoneFound)
  }
  if (nameFound || phoneFound) {
    return true
  }
  return false
  /*End of Q4*/
}

//Resolver2: Mutation
async function addTraveller(_, {ticket})
{	
  console.log("Adding traveller", ticket);
  async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
      { _id: name },//find the entry that matches this _id
      { $inc: { current: 1 } }, //perform the update
      { returnOriginal: false },//do not return the old value, only updated counter value.
    );
    return result.value.current;
  }
  ticket.id = await getNextSequence('fixedindex');

  /*Q2: Write code to talk to DB and add a new ticket.
   * Make sure you return the correct value of the correct type as per the schema.*/
  const newTraveller = {
    'id': ticket.id,
    'name': ticket.name,
    'phone': ticket.phone,
    'gender': ticket.gender,
    'isMember': ticket.isMember,
    'bookingTime': ticket.bookingTime
  }
  result = await db.collection('travellers').insertOne(newTraveller)

  if (result.result.ok === 1) {
    return result.ops[0]; // ops array contains the inserted documents
  } else {
    throw new Error("Failed to insert traveller");
  }

  /*End of Q2*/
}


/*Resolver3: GraphQL Scalar
//Below function is a GraphQL scalar that defines a valid Date.
//Serialize is used to send back/return a date in string format.
//ParseValue is used to convert all input values that are provided as an input JS variable.
//ParseLiteral is used to convert all input values that are in Int, String, etc. to a JSON-like form that GraphQL understands.
*/
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    console.log(value)
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

async function deleteTraveller(_, { travellername }) {
  /*Q2: Write code to talk to DB and delete the given passenger.
   * Note: Ensure that the function parameters for deleteTraveller() defined above  matches the
   * schema defined in travellerschema.graphql.*/
  console.log("Deleting traveller", travellername);
  async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
      { _id: name },//find the entry that matches this _id
      { $inc: { current: -1 } }, // decrement the current value
      { returnOriginal: false },//do not return the old value, only updated counter value.
    );
    return result.value.current;
  }
  await getNextSequence('fixedindex');

  result = await db.collection('travellers').deleteOne({ name: travellername })

  if (result.deletedCount === 1) {
    console.log(`Document with name ${travellername} deleted successfully.`);
    return true
  } else {
    console.log(`No document with name ${travellername} found for deletion.`);
    return false
  }
  /*End of Q2*/
}


/*Q4: Placeholder for blacklistTraveller() resolver.
 * This function should accept a traveller name and add them to a collection named blacklist.
 * */
async function blacklistTravellerName(_, { travellername }) {
  console.log("blacklistTraveller has been called");
  var ack = await db.collection('blacklist').insertOne({ name: travellername });
  console.log(ack.insertedCount);
  return ack.insertedCount == 1;
}

async function blacklistTravellerPhone(_, { travellerphone }) {
  console.log("blacklistTraveller has been called");
  var ack = await db.collection('blacklist').insertOne({ phone: travellerphone });
  console.log(ack.insertedCount);
  return ack.insertedCount == 1;
}

/*End of Q4*/

const resolvers = {
  Query: {
    listTravellers,
    findBlackListTraveller,
  },
  Mutation: {
    addTraveller,
    deleteTraveller,
    /*Q4. Make an entry for blacklistTraveller resolver here*/
    blacklistTravellerName,
    blacklistTravellerPhone,
  },
  GraphQLDate,
};

const app = express();
app.use(express.static('public'));

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./travellerschema.graphql', 'utf-8'),
  resolvers,
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

async function connectToDb() {
  const url = 'mongodb://localhost/tickettoride';
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to Ticket To Ride MongoDB at', url);
  db = client.db();
}


(async function () {
  try {
    await connectToDb();
    app.listen(8000, function () {
      console.log('App started on port 8000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();
