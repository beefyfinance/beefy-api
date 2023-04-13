import { groupBy, mapValues, partition } from 'lodash';
import { ApiChain, toChainId } from './chain';
import { web3Factory } from './web3';
import { MULTICALL_V3 } from './web3Helpers';
import { Multicall } from 'ethereum-multicall';
import chainLinkOracleAbi from '../abis/ChainLinkOracle.json';
import BigNumber from 'bignumber.js';
import { fromWei } from './big-number';
import { subSeconds } from 'date-fns';
import { isResultFulfilled } from './promise';
import { median } from './number';

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
  const chainId = toChainId(chain);
  const multicallAddress = MULTICALL_V3[chainId];
  if (!multicallAddress) {
    throw new Error(`Multicallv3 address not found for chain ${this.chain}`);
  }
  const multicall = new Multicall({
    web3Instance: web3Factory(chainId),
    tryAggregate: true,
    multicallCustomContractAddress: multicallAddress,
  });

  const { results } = await multicall.call(
    oracles.map(oracle => ({
      reference: oracle.oracleId,
      contractAddress: oracle.address,
      abi: chainLinkOracleAbi,
      calls: [
        {
          reference: 'roundData',
          methodName: 'latestRoundData',
          methodParameters: [],
        },
        {
          reference: 'decimals',
          methodName: 'decimals',
          methodParameters: [],
        },
      ],
    }))
  );

  const now = new Date();

  const prices: Record<string, number> = {};

  Object.values(results).forEach(({ originalContractCallContext, callsReturnContext }) => {
    const oracleId = originalContractCallContext.reference;
    const oracle = oracles.find(o => o.oracleId === oracleId);
    const [roundDataResult, decimalsResult] = callsReturnContext;

    if (!roundDataResult.success || !decimalsResult.success) {
      console.error(`ChainLink: Failed to fetch price for ${oracleId} on chain ${chain}`);
      return;
    }

    if (roundDataResult.returnValues.length !== 5 || decimalsResult.returnValues.length !== 1) {
      console.error(`ChainLink: Error in fetched price for ${oracleId} on chain ${chain}`);
      return;
    }

    const decimals = parseInt(decimalsResult.returnValues[0], 16);

    const roundData: RoundData = {
      roundId: new BigNumber(roundDataResult.returnValues[0].hex).toString(10),
      answer: fromWei(new BigNumber(roundDataResult.returnValues[1].hex), decimals).toNumber(),
      startedAt: new Date(parseInt(roundDataResult.returnValues[2].hex, 16) * 1000),
      updatedAt: new Date(parseInt(roundDataResult.returnValues[3].hex, 16) * 1000),
      answeredInRound: new BigNumber(roundDataResult.returnValues[4].hex).toString(10),
    };

    const heartbeatAgo = subSeconds(now, oracle.heartbeat + Math.max(oracle.heartbeat * 0.2, 300)); // 10% leeway or min. 5 minutes
    if (roundData.updatedAt < heartbeatAgo) {
      console.error(
        `ChainLink: Price for ${oracleId} on chain ${chain} is too old (Updated at ${roundData.updatedAt}, heartbeat ${oracle.heartbeat}s)`
      );
      return;
    }

    prices[oracleId] = roundData.answer;
  });

  return prices;
}
