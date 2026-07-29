import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import { default as IBalancerVaultV3 } from '../../../../abis/IBalancerVaultV3.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'balancer' });

export type BalancerV3PriceToken = {
  oracleId?: string;
  decimals: string;
};

type BalancerV3PricePoolFields = {
  name: string;
  address: string;
  decimals: string;
  tokens: BalancerV3PriceToken[];
};

type NotComposable = {
  composable?: false | undefined;
  bptIndex?: number;
};

type Composable = {
  composable: boolean;
  bptIndex: number;
};

export type BalancerV3PricePool = BalancerV3PricePoolFields & (NotComposable | Composable);

const getBalancerV3Prices = async (chainId: ChainId, pools: BalancerV3PricePool[], tokenPrices: PricesById) => {
  let prices: Record<string, StandardLpBreakdown> = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(chainId, pools);
  for (let i = 0; i < pools.length; i++) {
    let price = await getPoolPrice(pools[i], tokenAddresses[i], balances[i], totalSupplys[i], tokenPrices);
    prices = { ...prices, ...price };
  }

  return prices;
};

const getPoolsData = async (chainId: ChainId, pools: BalancerV3PricePool[]) => {
  const totalSupplyCalls = pools.map(pool => {
    const contract = fetchContract(pool.address, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });
  const balanceCalls = pools.map(pool => {
    const contract = fetchContract(pool.address, IBalancerVaultV3, chainId);
    return contract.read.getTokenInfo();
  });
  const [balanceResults, supplyResults] = await Promise.all([Promise.all(balanceCalls), Promise.all(totalSupplyCalls)]);
  const tokenAddresses = balanceResults.map(v => v[0]);
  const balances = balanceResults.map(v => {
    return v[2].map(v2 => new BigNumber(v2.toString()));
  });
  const totalSupplys = supplyResults.map(v => new BigNumber(v.toString()));

  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = async (
  pool: BalancerV3PricePool,
  tokenAddresses: readonly Address[],
  balance: BigNumber[],
  totalSupply: BigNumber,
  tokenPrices: PricesById
): Promise<Record<string, StandardLpBreakdown>> => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  let shiftedBalances = [];
  let tokens = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    if (pool.composable) {
      if (i != pool.bptIndex) {
        tokenPrice = await getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
        tokenBalInUsd = balance[i].times(tokenPrice).dividedBy(pool.tokens[i].decimals);
        totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
        shiftedBalances.push(balance[i].dividedBy(pool.tokens[i].decimals).toString(10));
        tokens.push(tokenAddresses[i]);
      }
    } else {
      tokenPrice = await getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
      tokenBalInUsd = balance[i].times(tokenPrice).dividedBy(pool.tokens[i].decimals);
      totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
      shiftedBalances.push(balance[i].dividedBy(pool.tokens[i].decimals).toString(10));
      tokens.push(tokenAddresses[i]);
    }
  }
  if (pool.composable) {
    totalSupply = totalSupply.minus(balance[pool.bptIndex]);
  }
  const price = totalStakedinUsd.times(pool.decimals).dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: tokens,
      balances: shiftedBalances,
      totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
    },
  };
};

const getTokenPrice = (tokenPrices: PricesById, oracleId: string | undefined) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ token: tokenSymbol }, 'unknown token, consider adding it to .json file');
  }
  return tokenPrice;
};

export default getBalancerV3Prices;
