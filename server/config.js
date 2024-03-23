const dbName = 'moodtracker';
const dbPort = 27017;
const dbUrl = `mongodb://localhost:${dbPort}/${dbName}`;
const backendPort = 8000;

module.exports = { dbName, dbPort, dbUrl, backendPort };
