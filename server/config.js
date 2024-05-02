require('dotenv').config();

const dbName = process.env.DB_NAME || 'moodtracker';
const dbPort = process.env.DB_PORT || 27017;
const dbUrl = `mongodb://mongo-db:${dbPort}/${dbName}`;
const backendPort = process.env.BACKEND_PORT || 8000;
const saltRounds = process.env.SALT_ROUNDS || 10;
const jwtSecret = process.env.JWT_SECRET || "";
const tokenExp = process.env.TOKEN_EXP_IN_S || 3600;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

module.exports = { dbName, dbPort, dbUrl, backendPort, saltRounds, jwtSecret, tokenExp, frontendUrl };
