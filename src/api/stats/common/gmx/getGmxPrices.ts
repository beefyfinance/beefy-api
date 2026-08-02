import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import GlpManagerAbi from '../../../../abis/arbitrum/GlpManager.ts';
import ERC20Abi from '../../../../abis/ERC20Abi.ts';
import type { PricesById } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';
import type { GmxPool } from './types.ts';

const logger = getLoggerFor({ module: 'prices', component: 'gmx' });

export const getGmxPrices = withTracing(
  async (chainId: ChainId, pools: GmxPool[], tokenPrices: PricesById) => {
    let prices = {};
    const values = await Promise.all(pools.map(pool => getPrice(chainId, pool, tokenPrices)));

    for (const item of values) {
      prices = { ...prices, ...item };
    }

    return prices;
  },
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
);

const getPrice = async (chainId: ChainId, pool: GmxPool, tokenPrices: PricesById) => {
  if (pool.oracle == 'lps') {
    const [{ price, totalSupply }, { tokens, shiftedBalances }] = await Promise.all([
      getLpPrice(chainId, pool),
      getLpTokenBalances(chainId, pool),
    ]);
    return {
      [pool.name]: {
        price: price,
        tokens: tokens,
        balances: shiftedBalances,
        totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
      },
    };
  } else {
    let price = getTokenPrice(tokenPrices, pool.oracleId);
    return { [pool.name]: price };
  }
};

const getTokenPrice = (tokenPrices: PricesById, oracleId: string | undefined) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ token: tokenSymbol }, 'unknown token, consider adding it to json file');
  }
  return tokenPrice;
};

const getLpTokenBalances = async (chainId: ChainId, pool: GmxPool) => {
  const poolTokens = pool.tokens ?? [];
  const balanceCalls = poolTokens.map(token => {
    const contract = fetchContract(token.address, ERC20Abi, chainId);
    // FIXME(unsafe-cast): may be undefined
    return contract.read.balanceOf([pool.vault as Address]);
  });
  const balanceResults = await Promise.all(balanceCalls);
  const bal = balanceResults.map(v => new BigNumber(v));

  const tokens: string[] = [];
  const shiftedBalances: string[] = [];
  for (let i = 0; i < poolTokens.length; i++) {
    shiftedBalances.push(bal[i].dividedBy(poolTokens[i].decimals).toString(10));
    tokens.push(poolTokens[i].address);
  }

  return { tokens, shiftedBalances };
};

const getLpPrice = async (chainId: ChainId, pool: GmxPool) => {
  if (!pool.glpManager) {
    throw new Error(`gmx pool ${pool.name} is missing glpManager`);
  }
  const glpManagerContract = fetchContract(pool.glpManager, GlpManagerAbi, chainId);
  const glpContract = fetchContract(pool.address, ERC20Abi, chainId);

  const result = await Promise.all([glpManagerContract.read.getAum([false]), glpContract.read.totalSupply()]);
  const aum = new BigNumber(result[0]);
  const totalSupply = new BigNumber(result[1]);
  const price = aum.dividedBy(totalSupply).dividedBy('1e12').toNumber();

  return { price, totalSupply };
};
