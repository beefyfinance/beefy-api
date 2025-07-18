import { groupBy, mapValues } from 'lodash';
import { ApiChain, toChainId } from './chain';
import BigNumber from 'bignumber.js';
import { fromWei } from './big-number';
import { subSeconds } from 'date-fns';
import { isResultFulfilled } from './promise';
import { median } from './number';
import { fetchContract } from '../api/rpc/client';
import { chainLinkOracleAbi } from '../abis/ChainLinkOracle';

type Oracle = {
  oracleId: string;
  address: string;
  chain: ApiChain;
  /** max time between oracle updates; we reject if % over this threshold */
  heartbeat: number;
};

type RoundData = {
  roundId: string;
  answer: number;
  startedAt: Date;
  updatedAt: Date;
  answeredInRound: string;
};

/**
 * @see https://data.chain.link/categories/crypto-usd
 */
const oracles: Oracle[] = [
  {
    oracleId: 'ETH',
    address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'BTC',
    address: '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'MATIC',
    address: '0xab594600376ec9fd91f8e885dadf0ce036862de0',
    chain: 'polygon',
    heartbeat: 3600,
  },
  {
    oracleId: 'AVAX',
    address: '0x0a77230d17318075983913bc2145db16c7366156',
    chain: 'avax',
    heartbeat: 120,
  },
  {
    oracleId: 'BNB',
    address: '0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee',
    chain: 'bsc',
    heartbeat: 60,
  },
  {
    oracleId: 'LINK',
    address: '0x2c1d072e956affc0d435cb7ac38ef18d24d9127c',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'AAVE',
    address: '0x547a514d5e3769680Ce22B2361c10Ea13619e8a9',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'SOL',
    address: '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'UNI',
    address: '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'Cake',
    address: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
    chain: 'bsc',
    heartbeat: 60,
  },
  {
    oracleId: 'XVS',
    address: '0xBF63F430A79D4036A5900C19818aFf1fa710f206',
    chain: 'bsc',
    heartbeat: 900,
  },
  {
    oracleId: 'USDT',
    address: '0x3e7d1eab13ad0104d2750b8863b489d65364e32d',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'DAI',
    address: '0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'USDC',
    address: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    // given this is on Ethereum, it is probably the price of LFRAX
    // there is a new frxUSD token on Ethereum so this oracle might become outdated
    oracleId: 'FRAX', // reminder: FRAX is oracle for frxUSD on Fraxtal
    address: '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'BAL',
    address: '0xdF2917806E30300537aEB49A7663062F4d1F2b5F',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'KAVA',
    address: '0x7899dd75C329eFe63e35b02bC7d60D3739FB23c5',
    chain: 'polygon',
    heartbeat: 864000,
  },
  {
    oracleId: 'CAD',
    address: '0xa34317DB73e77d453b1B8d04550c44D10e981C8e',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'EURC',
    address: '0x3368310bc4aee5d96486a73bae8e6b49fcde62d3',
    chain: 'avax',
    heartbeat: 864000,
  },
  {
    oracleId: 'GRT',
    address: '0x86cF33a451dE9dc61a2862FD94FF4ad4Bd65A5d2',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'SEI',
    address: '0x6f6cED6B096708C1276056fdBdb7BbDe07Ca462C',
    chain: 'optimism',
    heartbeat: 864000,
  },
  {
    oracleId: 'GHO',
    address: '0x3f12643D3f6f874d39C2a4c9f2Cd6f2DbAC877FC',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'wstETH',
    address: '0x698B585CbC4407e2D54aa898B2600B53C68958f7',
    chain: 'optimism',
    heartbeat: 864000,
  },
  {
    oracleId: 'GNO',
    address: '0x22441d81416430A54336aB28765abd31a792Ad37',
    chain: 'gnosis',
    heartbeat: 864000,
  },
  {
    oracleId: 'USDe',
    address: '0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'HYPE',
    address: '0xf9ce4fE2F0EcE0362cb416844AE179a49591D567',
    chain: 'arbitrum',
    heartbeat: 864000,
  },
  {
    oracleId: 'sfrxUSD',
    address: '0xCC8DA199b159f25E7782494Df9140d2ce0Fe048B',
    chain: 'sonic',
    heartbeat: 864000,
  },
];

export async function fetchChainLinkPrices(): Promise<Record<string, number>> {
  const oraclesByChain: Partial<Record<ApiChain, Oracle[]>> = groupBy(oracles, 'chain');
  const chains = Object.keys(oraclesByChain) as ApiChain[];
  const pricesPerChain = await Promise.allSettled(
    Object.entries(oraclesByChain).map(([chain, oracles]) => fetchPricesForChain(chain as ApiChain, oracles))
  );

  const pricesByOracle: Record<string, number[]> = {};
  for (const i in pricesPerChain) {
    const chain = chains[i];
    const result = pricesPerChain[i];

    if (isResultFulfilled(result)) {
      const prices = result.value;
      for (const [oracleId, price] of Object.entries(prices)) {
        if (!pricesByOracle[oracleId]) {
          pricesByOracle[oracleId] = [];
        }
        pricesByOracle[oracleId].push(price);
      }
    } else {
      console.error(`ChainLink: Failed to fetch prices for chain ${chain}`, result.reason);
    }
  }

  // Median price for same oracle on multiple chains
  return mapValues(pricesByOracle, median);
}

async function fetchPricesForChain(chain: ApiChain, oracles: Oracle[]): Promise<Record<string, number>> {
  const results = await Promise.allSettled(
    oracles.map(async (oracle): Promise<RoundData> => {
      const contract = fetchContract(oracle.address, chainLinkOracleAbi, toChainId(chain));
      const [roundData, decimals] = await Promise.all([
        contract.read.latestRoundData(),
        contract.read.decimals(),
      ]);

      return {
        roundId: roundData[0].toString(),
        answer: fromWei(new BigNumber(roundData[1].toString()), decimals).toNumber(),
        startedAt: new Date(Number(roundData[2]) * 1000),
        updatedAt: new Date(Number(roundData[3]) * 1000),
        answeredInRound: new BigNumber(roundData[4].toString()).toString(10),
      };
    })
  );

  const now = new Date();
  const prices: Record<string, number> = {};

  results.forEach((result, index) => {
    const oracle = oracles[index];

    if (!isResultFulfilled(result)) {
      console.error(
        `ChainLink: Failed to fetch price for ${oracle.oracleId} on chain ${chain}`,
        result.reason
      );
      return;
    }

    const roundData = result.value;
    const heartbeatAgo = subSeconds(now, oracle.heartbeat + Math.max(oracle.heartbeat * 0.2, 300)); // 10% leeway or min. 5 minutes
    if (roundData.updatedAt < heartbeatAgo) {
      console.error(
        `ChainLink: Price for ${oracle.oracleId} on chain ${chain} is too old (Updated at ${roundData.updatedAt}, heartbeat ${oracle.heartbeat}s)`
      );
      return;
    }

    prices[oracle.oracleId] = roundData.answer;
  });

  return prices;
}
