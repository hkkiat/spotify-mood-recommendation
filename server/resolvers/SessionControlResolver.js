const bcrypt = require('bcrypt');
const { ApolloError } = require('apollo-server-express');
const { saltRounds, jwtSecret, tokenExp } = require('../config');
const { UserNotFound, PasswordNotMatch } = require('./errors');
const jwt = require('jsonwebtoken');

async function logout(_, __, { res }) {
  res.clearCookie('_token');
  return {
    message: 'OK'
  };
}

async function register(_, { email, password }, { db, res }) {
  try {
    // Check duplicate emails
    const userExists = await db.collection('users').findOne({ email });
    if (userExists) {
      throw new ApolloError('User with this email already exists, please login instead.');
    }

    // Generate salt and hash password
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
    if (isNaN(saltRounds)) {
      throw new Error("saltRounds must be a number");
    }
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    // Store hash in your password DB.
    const user = await db.collection('users').insertOne({ email, password: hash });

    // Log user in (ensure this function is properly handling async operations)
    await logUserIn(user, res);

    // Return a valid result that is not null
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
    console.log("Check user ", user)
    if (!user) {
      throw new ApolloError(UserNotFound);
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      throw new ApolloError(PasswordNotMatch);
    }

    logUserIn(user, res);

    return {
      message: 'OK'
    };
  } catch (error) {
    throw new ApolloError('Failed to login: ' + error.message);
  }
}





async function verifyPassword(password, hashedPassword) {
  console.log("hashedPassword: ", hashedPassword)
  console.log("password: ", password)
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match
  } catch (error) {
    throw new ApolloError('Failed to verify password: ' + error.message);
  }
}

function logUserIn(user, res) {
  const token = generateToken(user);
  setCookie(res, token);
}

function generateToken(user) {
  const sessionHash = { id: user._id, email: user.email, iat: Date.now() };
  const token = jwt.sign(sessionHash, jwtSecret, {
    expiresIn: '60m',
  });
  return token;
}

function setCookie(res, token) {
  res.header('Set-Cookie', `_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${tokenExp * 1000};`);
}


module.exports = { login, register, logout };