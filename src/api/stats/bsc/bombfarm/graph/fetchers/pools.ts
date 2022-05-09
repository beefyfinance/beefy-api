const { ApolloClient } = require('apollo-client');
const gql = require('graphql-tag');
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;
const createHttpLink = require('apollo-link-http').createHttpLink;
const fetch = require('node-fetch');

import { GRAPH_HOST } from '../constants';

import { poolQuery } from '../queries/pools';

const appClient = new ApolloClient({
  link: createHttpLink({
    uri: GRAPH_HOST,
    fetch,
  }),
  cache: new InMemoryCache(),
});

export const bombMaxi = (poolId: string) =>
  appClient.query({
    query: gql(poolQuery),
    variables: {
      id: poolId,
    },
  });
//     .then((data) => return data.data.pool
//        // console.log('Subgraph data: ', data.data.pool))
// .catch((err) => {
//     console.log('Error fetching data: ', err);

// });
