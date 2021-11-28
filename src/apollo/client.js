const { ApolloClient } = require('apollo-client');
const fetch = require('node-fetch');
const createHttpLink = require('apollo-link-http').createHttpLink;
const InMemoryCache = require('apollo-cache-inmemory').InMemoryCache;

function client(url) {
  return new ApolloClient({
    link: createHttpLink({ uri: url, fetch }),
    cache: new InMemoryCache(),
  });
}

const apePolyClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const sushiClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

const sushiOneClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const sushiArbitrumClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const sushiCeloClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const sushiMoonriverClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/moonriver-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const comethClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/cometh-game/comethswap',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const quickClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const polyzapClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/polyzap/exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const spookyClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/eerieeight/spooky-swap-exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const spiritClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const cakeClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const apeClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const wexpolyClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://polyinfo.wault.finance/subgraphs/name/WaultFinance/waultswap-subgraph',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const mdexHecoClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://graph.mdex.com/subgraphs/name/mdex/swap',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const mdexBscClient = new ApolloClient({
  link: createHttpLink({
    // uri: 'https://bsc-graph.mdex.com/subgraphs/name/chains/bsc',
    uri: 'https://bsc-lite-graph.mdex.cc/subgraphs/name/chain/bsc',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const pangolinClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const lydiaClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/lydiacoder/lydia',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const oliveClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/olive-rose/olivecash',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const complusAvaxClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://graph.avagraph.live/subgraphs/name/complusnetwork/subgraph-ava',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const pantherClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.bscgraph.org/subgraphs/name/pantherswap/exchange',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const jetswapClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const jetswapPolyClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const jetswapFantomClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const dfynClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v5',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const solarbeamClient = new ApolloClient({
  link: createHttpLink({
    uri: 'https://analytics.solarbeam.io/api/subgraph',
    fetch,
  }),
  cache: new InMemoryCache(),
});

const joeClient = client('https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange');
const babyClient = client('https://api.thegraph.com/subgraphs/name/babyswapgraph/exchange3');
const kyberClient = client(
  'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-matic'
);
const beetClient = client('https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx');
const vvsClient = client('https://graph.vvs.finance/exchange');
const finnClient = client('https://graph-node.huckleberry.finance/subgraphs/name/huckleberry/huckleberry-subgraph');

const isSushiClient = client => {
  return (
    client === sushiClient ||
    client === sushiOneClient ||
    client === sushiArbitrumClient ||
    client === joeClient ||
    client === sushiCeloClient ||
    client === sushiMoonriverClient
  );
};

const isBeetClient = client => {
  return client === beetClient;
};

module.exports = {
  joeClient,
  dfynClient,
  apePolyClient,
  sushiClient,
  sushiOneClient,
  sushiArbitrumClient,
  sushiCeloClient,
  sushiMoonriverClient,
  isSushiClient,
  comethClient,
  quickClient,
  polyzapClient,
  spookyClient,
  spiritClient,
  cakeClient,
  apeClient,
  wexpolyClient,
  mdexHecoClient,
  mdexBscClient,
  pangolinClient,
  complusAvaxClient,
  oliveClient,
  lydiaClient,
  pantherClient,
  jetswapClient,
  jetswapPolyClient,
  jetswapFantomClient,
  kyberClient,
  solarbeamClient,
  babyClient,
  beetClient,
  isBeetClient,
  vvsClient,
  finnClient,
};
