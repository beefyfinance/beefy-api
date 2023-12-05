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
    oracleId: 'ETH',
    address: '0xf9680d99d6c9589e2a93a78a04a279e509205945',
    chain: 'polygon',
    heartbeat: 27,
  },
  {
    oracleId: 'MATIC',
    address: '0xab594600376ec9fd91f8e885dadf0ce036862de0',
    chain: 'polygon',
    heartbeat: 27,
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
    heartbeat: 27,
  },
  {
    oracleId: 'LINK',
    address: '0x2c1d072e956affc0d435cb7ac38ef18d24d9127c',
    chain: 'ethereum',
    heartbeat: 3600,
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
    oracleId: 'BTC',
    address: '0xc907e116054ad103354f2d350fd2514433d57f6f',
    chain: 'polygon',
    heartbeat: 27,
  },
  {
    oracleId: 'USDC',
    address: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
    chain: 'ethereum',
    heartbeat: 864000,
  },
  {
    oracleId: 'FRAX',
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
    oracleId: 'FTM',
    address: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    chain: 'fantom',
    heartbeat: 3600,
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
];

export async function fetchChainLinkPrices(): Promise<Record<string, number>> {
  const oraclesByChain: Partial<Record<ApiChain, Oracle[]>> = groupBy(oracles, 'chain');
  const chains = Object.keys(oraclesByChain) as ApiChain[];
  const pricesPerChain = await Promise.allSettled(
    Object.entries(oraclesByChain).map(([chain, oracles]) =>
      fetchPricesForChain(chain as ApiChain, oracles)
    )
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

async function fetchPricesForChain(
  chain: ApiChain,
  oracles: Oracle[]
): Promise<Record<string, number>> {
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
