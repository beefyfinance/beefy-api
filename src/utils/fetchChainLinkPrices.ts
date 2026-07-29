import { BigNumber } from 'bignumber.js';
import { subSeconds } from 'date-fns';
import { groupBy } from 'lodash-es';
import { chainLinkOracleAbi } from '../abis/ChainLinkOracle.ts';
import { fetchContract } from '../api/rpc/client.ts';
import { fromWei } from './big-number.ts';
import { type ApiChain, toChainId } from './chain.ts';
import { getLoggerFor } from './logger/index.ts';
import { median } from './number.ts';
import { isResultFulfilled } from './promise.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'chainlink' });

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
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'BTC',
    address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'MATIC',
    address: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
    chain: 'polygon',
    heartbeat: 3600,
  },
  {
    oracleId: 'AVAX',
    address: '0x0A77230d17318075983913bC2145DB16C7366156',
    chain: 'avax',
    heartbeat: 120,
  },
  {
    oracleId: 'BNB',
    address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    chain: 'bsc',
    heartbeat: 60,
  },
  {
    oracleId: 'LINK',
    address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
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
    address: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'DAI',
    address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
    chain: 'ethereum',
    heartbeat: 3600,
  },
  {
    oracleId: 'USDC',
    address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
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
    oracleId: 'FXS',
    address: '0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'BAL',
    address: '0xdF2917806E30300537aEB49A7663062F4d1F2b5F',
    chain: 'ethereum',
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
    address: '0x3368310bC4AeE5D96486A73bae8E6b49FcDE62D3',
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
    oracleId: 'MetaMaskUSD',
    address: '0xc90E3460424fb8ea79775089E9053113FEE34Ed0',
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
    oracleId: 'frxUSD',
    address: '0x9B4a96210bc8D9D55b1908B465D8B0de68B7fF83',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'sfrxUSD',
    address: '0xCC8DA199b159f25E7782494Df9140d2ce0Fe048B',
    chain: 'sonic',
    heartbeat: 864000,
  },
  {
    oracleId: 'MON',
    address: '0xBcD78f76005B7515837af6b50c7C52BCf73822fb',
    chain: 'monad',
    heartbeat: 3600,
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
      logger.warn({ chain, err: result.reason }, 'failed to fetch prices for chain');
    }
  }

  // Median price for same oracle on multiple chains
  const medianPrices: Record<string, number> = {};
  for (const [oracleId, prices] of Object.entries(pricesByOracle)) {
    const medianPrice = median(prices);
    if (medianPrice !== undefined) {
      medianPrices[oracleId] = medianPrice;
    }
  }

  return medianPrices;
}

async function fetchPricesForChain(chain: ApiChain, oracles: Oracle[]): Promise<Record<string, number>> {
  const results = await Promise.allSettled(
    oracles.map(async (oracle): Promise<RoundData> => {
      const contract = fetchContract(oracle.address, chainLinkOracleAbi, toChainId(chain));
      const [roundData, decimals] = await Promise.all([contract.read.latestRoundData(), contract.read.decimals()]);

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
      logger.warn({ oracleId: oracle.oracleId, chain, err: result.reason }, 'failed to fetch oracle price');
      return;
    }

    const roundData = result.value;
    const heartbeatAgo = subSeconds(now, oracle.heartbeat + Math.max(oracle.heartbeat * 0.2, 300)); // 10% leeway or min. 5 minutes
    if (roundData.updatedAt < heartbeatAgo) {
      logger.warn(
        {
          oracleId: oracle.oracleId,
          chain,
          updatedAt: roundData.updatedAt,
          heartbeat: oracle.heartbeat,
        },
        'oracle price too old'
      );
      return;
    }

    prices[oracle.oracleId] = roundData.answer;
  });

  return prices;
}
