import { ApolloClient, InMemoryCache, HttpLink, defaultDataIdFromObject } from 'apollo-boost';
import { ApolloLink } from 'apollo-link';
import * as configs from './configs';
import { onError } from 'apollo-link-error';


import { createHttpLink } from 'apollo-link-http';

const httpLink = createHttpLink({
  credentials: 'include',
  uri: `${configs.clientBackendApiUrl}/graphql`,
});


const cache = new InMemoryCache({
  dataIdFromObject: (object) => {
    return defaultDataIdFromObject(object);
  },
});

const ErrorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);

    let networkErrorObj = networkError as any;
    const statusCode = networkErrorObj.statusCode;
    if (statusCode === 403) {
      console.log("Invalid session, redirecting to login page...");
      alert("Invalid session, redirecting to login page...");
      window.location.href = "/";
    }

    if (statusCode === 302) {
      console.log("Already has a session, redirecting from login page...");
      alert("Already has a session, redirecting from login page...");
      window.location.href = '/moodlog';
    }
  }
})

const defaultOptions: any = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  }
};

export const defaultClient = new ApolloClient({
  cache,
  defaultOptions,
  link: ApolloLink.from([ErrorLink, httpLink]),
});
