const fetch = require('node-fetch');
const createHttpLink = require('apollo-link-http').createHttpLink;
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import ApolloLinkTimeout from 'apollo-link-timeout';

const APOLLO_TIMEOUT = process.env.APOLLO_TIMEOUT || 30_000;
const timeoutLink = new ApolloLinkTimeout(APOLLO_TIMEOUT);

function client(url) {
  const httpLink = createHttpLink({ uri: url, fetch });
  const timeoutHttpLink = timeoutLink.concat(httpLink);
  return new ApolloClient({
    link: timeoutHttpLink,
    cache: new InMemoryCache({
      addTypename: false,
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
}

const apePolyClient = client('https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon');
const sushiPolyClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange');
const sushiOneClient = client(
  'https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange'
);
const sushiArbitrumClient = client(
  'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange'
);
const sushiCeloClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange');
const sushiMoonriverClient = client(
  'https://api.thegraph.com/subgraphs/name/sushiswap/moonriver-exchange'
);
const sushiFantomClient = client(
  'https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange'
);
const sushiFuseClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/fuse-exchange');
const comethClient = client('https://api.thegraph.com/subgraphs/name/cometh-game/comethswap');
const quickClient = client('https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06');
const polyzapClient = client('https://api.thegraph.com/subgraphs/name/polyzap/exchange');
const spookyClient = client(
  'https://api.thegraph.com/subgraphs/name/eerieeight/spooky-swap-exchange'
);
const spiritClient = client(
  'https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics'
);
const cakeClient = client('https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2');
const apeClient = client('https://graph.apeswap.finance/subgraphs/name/ape-swap/apeswap-subgraph');
const wexpolyClient = client(
  'https://polyinfo.wault.finance/subgraphs/name/WaultFinance/waultswap-subgraph'
);
const mdexHecoClient = client('https://graph.mdex.com/subgraphs/name/mdex/swap');
const mdexBscClient = client('https://bsc-lite-graph.mdex.cc/subgraphs/name/chain/bsc');
const pangolinClient = client('https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex');
const lydiaClient = client('https://api.thegraph.com/subgraphs/name/lydiacoder/lydia');
const oliveClient = client('https://api.thegraph.com/subgraphs/name/olive-rose/olivecash');
const complusAvaxClient = client(
  'https://graph.avagraph.live/subgraphs/name/complusnetwork/subgraph-ava'
);
const pantherClient = client('https://api.bscgraph.org/subgraphs/name/pantherswap/exchange');
const jetswapClient = client(
  'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph'
);
const jetswapPolyClient = client(
  'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon'
);
const jetswapFantomClient = client(
  'https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom'
);
const dfynClient = client('https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v5');
const solarbeamClient = client('https://analytics.solarbeam.io/api/subgraph');
const joeClient = client('https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange');
const babyClient = client('https://api.thegraph.com/subgraphs/name/babyswapgraph/exchange3');
const kyberClient = client(
  'https://api.thegraph.com/subgraphs/name/dynamic-amm/dmm-exchange-matic'
);
const beetClient = client('https://graph-node.beets-ftm-node.com/subgraphs/name/beethovenx');
const beamClient = client('https://api.thegraph.com/subgraphs/name/beamswap/beamswap-dex');
const solarflareClient = client('https://analytics.solarflare.io/api/subgraph');
const stellaClient = client('https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap');
const vvsClient = client('https://graph.vvs.finance/exchange');
const finnClient = client(
  'https://graph-node.huckleberry.finance/subgraphs/name/huckleberry/huckleberry-subgraph'
);
const dinoClient = client('https://api.thegraph.com/subgraphs/name/jannerveglobal/dino-swap-dex');
const fusefiClient = client('https://api.thegraph.com/subgraphs/name/fuseio/fuseswap');
const netswapClient = client('https://api.netswap.io/graph/subgraphs/name/netswap/exchange');
const tethysClient = client('https://node.tethys.finance/subgraphs/name/tethys');
const tombswapClient = client('https://api.thegraph.com/subgraphs/name/github-qfg/tombswap');
const biswapClient = client('https://api.thegraph.com/subgraphs/name/biswapcom/exchange5');
const pegasysClient = client('https://graph.pegasys.exchange/subgraphs/name/pollum-io/pegasys');

const isSushiClient = client => {
  return (
    client === sushiPolyClient ||
    client === sushiOneClient ||
    client === sushiArbitrumClient ||
    client === joeClient ||
    client === sushiCeloClient ||
    client === sushiMoonriverClient ||
    client === sushiFantomClient ||
    client === sushiFuseClient ||
    client === dinoClient
  );
};

const isBeetClient = client => {
  return client === beetClient;
};

module.exports = {
  dinoClient,
  joeClient,
  dfynClient,
  apePolyClient,
  sushiPolyClient,
  sushiOneClient,
  sushiArbitrumClient,
  sushiCeloClient,
  sushiMoonriverClient,
  sushiFantomClient,
  sushiFuseClient,
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
  fusefiClient,
  netswapClient,
  tethysClient,
  beamClient,
  solarflareClient,
  stellaClient,
  tombswapClient,
  biswapClient,
  pegasysClient,
};
