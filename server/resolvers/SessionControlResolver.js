const bcrypt = require('bcrypt');
const {  ApolloError } = require('apollo-server-express');
const { saltRounds, jwtSecret, tokenExp } = require('../config');
const {UserNotFound, PasswordNotMatch} = require('./errors');

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

    res.cookie('_token', )

    const sessionHash = { id: user._id, email: user.email };
    const token = jwt.sign(sessionHash, jwtSecret, {
      expiresIn: tokenExp,
    });
    // TO-DO: Implement setting of JWT token in the cookie
    res.cookie('_token', token, {
      httpOnly: true,
      secure: true,
      maxAge: tokenExp * 1000,
    });
    
    return true;
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


module.exports = { login };