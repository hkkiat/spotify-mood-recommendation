const bcrypt = require('bcrypt');
const { ApolloError } = require('apollo-server-express');
const { saltRounds, jwtSecret, tokenExp } = require('../config');
const { UserNotFound, PasswordNotMatch } = require('./errors');

async function register(_, { email, password }, { db, res }) {
  try {
    const hashedPassword = await hashPassword(password);
    // Check duplicate emails
    const userExists = await db.collection('users').findOne({ email });
    if (userExists) {
      throw new ApolloError('User with this email already exists, please login instead.');
    }

    const user = await db.collection('users').insertOne({ email, password: hashedPassword });
    logUserIn(user);

    return {
      message: 'OK'
    };
  } catch (error) {
    throw new ApolloError('Failed to register: ' + error.message);
  }
}

async function login(_, { email, password }, { db, res }) {
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      throw new ApolloError(UserNotFound);
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      throw new ApolloError(PasswordNotMatch);
    }

    logUserIn(user)

    return {
      message: 'OK'
    };
  } catch (error) {
    throw new ApolloError('Failed to login: ' + error.message);
  }
}

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}

function logUserIn(user) {
  const token = generateToken(user);
  setCookie(res, token);
}

function generateToken(user) {
  const sessionHash = { id: user._id, email: user.email };
  const token = jwt.sign(sessionHash, jwtSecret, {
    expiresIn: tokenExp,
  });
  return token;
}

function setCookie(res, token) {
  // TO-DO: Implement setting of JWT token in the cookie
  res.cookie('_token', token, {
    httpOnly: true,
    secure: true,
    maxAge: tokenExp * 1000,
  });
}


module.exports = { login, register };