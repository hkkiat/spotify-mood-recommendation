import { ApolloClient, InMemoryCache, HttpLink, defaultDataIdFromObject } from 'apollo-boost';
import { ApolloLink } from 'apollo-link';
import * as configs from './configs';

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

const defaultOptions: any = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
};

export const defaultClient = new ApolloClient({
  cache,
  defaultOptions,
  link: ApolloLink.from([httpLink]),
});
