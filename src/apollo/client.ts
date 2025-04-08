import { createHttpLink } from 'apollo-link-http';
import {
  ApolloClient,
  ApolloError,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
  RequestHandler,
} from '@apollo/client/core';
import ApolloLinkTimeout from 'apollo-link-timeout';

const APOLLO_TIMEOUT = process.env.APOLLO_TIMEOUT ? parseInt(process.env.APOLLO_TIMEOUT) : 30_000;
const THE_GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY || undefined; // The Free Plan includes 100,000 free monthly queries; you still need an API key
const timeoutLink: ApolloLink = new ApolloLinkTimeout(APOLLO_TIMEOUT);

export function client(url: string) {
  const httpLink = createHttpLink({ uri: url, fetch });
  const timeoutHttpLink = timeoutLink.concat(httpLink as any as ApolloLink | RequestHandler);
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

function throwIfQueriedClient(url: string) {
  const mockedQueryFn = async (options: any) => {
    throw new ApolloError({
      clientErrors: [new Error(`Can not query as THE_GRAPH_API_KEY env is missing`)],
      extraInfo: { url, options },
    });
  };

  return new Proxy(client(url), {
    get(target: ApolloClient<NormalizedCacheObject>, p: string | symbol, receiver: any): any {
      if (p === 'query') {
        return mockedQueryFn;
      }
      return Reflect.get(target, p, receiver);
    },
  });
}

export function theGraphClient(subgraphId: string, baseUrl: string = 'https://gateway.thegraph.com/api') {
  const url = `${baseUrl}/${THE_GRAPH_API_KEY || '${THE_GRAPH_API_KEY}'}/subgraphs/id/${subgraphId}`;

  if (THE_GRAPH_API_KEY) {
    return client(url);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`THE_GRAPH_API_KEY env is required for ${url}`);
  }

  return throwIfQueriedClient(url);
}

export const apePolyClient = client('https://api.thegraph.com/subgraphs/name/prof-sd/as-matic-graft');
export const sushiMainnetClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/exchange');
export const sushiPolyClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange');
export const sushiOneClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/exchange-harmony');
export const sushiArbitrumClient = client(
  'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange'
);
export const sushiCeloClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange');
export const sushiMoonriverClient = client(
  'https://api.thegraph.com/subgraphs/name/sushiswap/moonriver-exchange'
);
export const sushiFantomClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange');
export const sushiFuseClient = client('https://api.thegraph.com/subgraphs/name/sushiswap/fuse-exchange');
export const sushiKavaClient = client('https://pvt.graph.kava.io/subgraphs/name/sushi-0m/trident-kava');
// export const comethClient = client('https://api.thegraph.com/subgraphs/name/cometh-game/comethswap');
export const quickClient = client('https://api.fura.org/subgraphs/name/quickswap');
// export const polyzapClient = client('https://api.thegraph.com/subgraphs/name/polyzap/exchange');
export const spookyClient = client('https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap');
// export const spiritClient = client('https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics');
export const wigoClient = client('https://api.thegraph.com/subgraphs/name/wigoswap/exchange2');
export const cakeClient = client(process.env.PCS_GRAPHQL_KEY);
// export const apeClient = client('https://bnb.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph');
// export const wexpolyClient = client(  'https://polyinfo.wault.finance/subgraphs/name/WaultFinance/waultswap-subgraph');
// export const mdexHecoClient = client('https://graph.mdex.com/subgraphs/name/mdex/swap');
// export const mdexBscClient = client('https://bsc-lite-graph.mdex.cc/subgraphs/name/chain/bsc');
export const pangolinClient = client('https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex');
export const lydiaClient = client('https://api.thegraph.com/subgraphs/name/lydiacoder/lydia');
export const oliveClient = client('https://api.thegraph.com/subgraphs/name/olive-rose/olivecash');
// export const dfynClient = client('https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v5');
export const solarbeamClient = client('https://analytics.solarbeam.io/api/subgraph');
export const joeClient = client('https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange');
export const sjoeClient = theGraphClient('22nJbR5KwAPVrxsPtKGVfopNAtrcDP7JxvnbCn2DXPgK');
// export const babyClient = client('https://api.thegraph.com/subgraphs/name/babyswapgraph/exchange3');
export const beetClient = client('https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx');
export const beetOpClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-optimism-v2/version/latest'
);
export const balancerArbClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-arbitrum-v2/version/latest'
);
export const balancerAvaxClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-avalanche-v2/version/latest'
);
export const balancerPolyClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-polygon-v2/version/latest'
);
export const balancerZkevmClient = client(
  'https://api.studio.thegraph.com/query/24660/balancer-polygon-zk-v2/version/latest'
);
export const balancerBaseClient = client(
  'https://api.studio.thegraph.com/query/24660/balancer-base-v2/version/latest'
);

export const balancerGnosisClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-gnosis-chain-v2/version/latest'
);
export const beamClient = client('https://api.thegraph.com/subgraphs/name/beamswap/beamswap-dex');
export const solarflareClient = client('https://analytics.solarflare.io/api/subgraph');
export const stellaClient = client('https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap');
export const vvsClient = client('https://graph.cronoslabs.com/subgraphs/name/vvs/exchange');
export const finnClient = client(
  'https://api.thegraph.com/subgraphs/name/huckleberrydex/huckleberry-subgraph'
);
export const dinoClient = client('https://api.thegraph.com/subgraphs/name/jannerveglobal/dino-swap-dex');
export const fusefiClient = client('https://api.thegraph.com/subgraphs/name/fuseio/fuseswap');
export const netswapClient = client('https://api.netswap.io/graph/subgraphs/name/netswap/exchange');
export const tethysClient = client('https://graph-node.tethys.finance/subgraphs/name/tethys2');
// export const tombswapClient = client('https://api.thegraph.com/subgraphs/name/github-qfg/tombswap');
export const biswapClient = client('https://api.thegraph.com/subgraphs/name/biswapcom/exchange5');
// export const uniswapPolygonClient = client(  'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon');
export const balancerClient = client(
  'https://api.studio.thegraph.com/query/75376/balancer-v2/version/latest'
);

export const isSushiTridentClient = (client: ApolloClient<NormalizedCacheObject>) => {
  return client == sushiKavaClient;
};
export const hopArbClient = client('https://api.thegraph.com/subgraphs/name/hop-protocol/hop-arbitrum');
export const hopOpClient = client('https://api.thegraph.com/subgraphs/name/hop-protocol/hop-optimism');
export const hopPolyClient = client('https://api.thegraph.com/subgraphs/name/hop-protocol/hop-polygon');
export const gmxArbClient = client(
  'https://subgraph.satsuma-prod.com/3b2ced13c8d9/gmx/synthetics-arbitrum-stats/api'
);
export const baseSwapClient = client('https://api.thegraph.com/subgraphs/name/messari/baseswap-base');
export const defiveClient = theGraphClient('DJpniEjry879CJGYXnvryurMGbGZdY4gpT4faVUh4KdZ');

export const isSushiClient = (client: ApolloClient<NormalizedCacheObject>) => {
  return (
    client === sushiMainnetClient ||
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

export const isBeetClient = (client: ApolloClient<NormalizedCacheObject>) => {
  return client === beetClient;
};
