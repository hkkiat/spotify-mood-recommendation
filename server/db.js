const { MongoClient } = require('mongodb');
const { dbUrl } = require('./config');
let db;

async function connectToDb() {
  if (db) return db; // Return existing connection if already established
  const client = new MongoClient(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db();
  return db;
}

module.exports = { connectToDb };