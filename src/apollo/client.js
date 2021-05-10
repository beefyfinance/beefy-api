const { ApolloClient } = require('apollo-client');
const fetch = require('node-fetch');
const createHttpLink = require('apollo-link-http').createHttpLink;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;

const exchange_matic = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

const minichefv2_matic = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-minichef',
    fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

const blockClient_matic = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/matthewlilley/polygon-blocks',
    fetch,
  }),
  cache: new InMemoryCache(),
});

module.exports = {
  exchange_matic,
  minichefv2_matic,
  blockClient_matic,
};
