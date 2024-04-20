const { Kind } = require('graphql/language');
const { GraphQLScalarType } = require('graphql');
const { login } = require('./SessionControlResolver');
const { getAllMoodLogs, getExistingMoodLog, createMoodLog, updateMoodLog } = require('./MoodlogResolver');
const { authorize, refreshAccessToken, createPlaylistBasedOnFavorites } = require('./SpotifyResolver');

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

/*End of Q4*/

const resolvers = {
  Query: {
    getExistingMoodLog,
    getAllMoodLogs,
  },
  Mutation: {
    createMoodLog,
    updateMoodLog,
    /*Q4. Make an entry for blacklistTraveller resolver here*/
    login,
    authorize,
    refreshAccessToken,
    createPlaylistBasedOnFavorites,
  },
  GraphQLDate,
};

module.exports = resolvers;