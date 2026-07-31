import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address, Hex } from 'viem';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import { default as IBalancerVault } from '../../../../abis/IBalancerVault.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'balancer-v2' });

export type BalancerPriceToken = {
  oracleId?: string;
  decimals?: string;
};

type BalancerPricePoolFields = {
  name: string;
  address: string;
  vault: string;
  vaultPoolId: string;
  decimals: string;
  tokens: BalancerPriceToken[];
};

type NotComposable = {
  composable?: false | undefined;
  bptIndex?: number;
};

type Composable = {
  composable: boolean;
  bptIndex: number;
};

export type BalancerPricePool = BalancerPricePoolFields & (NotComposable | Composable);

const getBalancerPrices = async (chainId: ChainId, pools: BalancerPricePool[], tokenPrices: PricesById) => {
  let prices: Record<string, StandardLpBreakdown> = {};
  const { tokenAddresses, balances, totalSupplys } = await getPoolsData(chainId, pools);
  for (let i = 0; i < pools.length; i++) {
    const price = getPoolPrice(pools[i], tokenAddresses[i], balances[i], totalSupplys[i], tokenPrices);
    prices = { ...prices, ...price };
  }

  return prices;
};

const getPoolsData = async (chainId: ChainId, pools: BalancerPricePool[]) => {
  const totalSupplyCalls = pools.map(pool => {
    const contract = fetchContract(pool.address, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });
  const balanceCalls = pools.map(pool => {
    const contract = fetchContract(pool.vault, IBalancerVault, chainId);
    return contract.read.getPoolTokens([pool.vaultPoolId as Hex]);
  });
  const [balanceResults, supplyResults] = await Promise.all([Promise.all(balanceCalls), Promise.all(totalSupplyCalls)]);
  const tokenAddresses = balanceResults.map(v => v[0]);
  const balances = balanceResults.map(v => {
    return v[1].map(v2 => new BigNumber(v2));
  });
  const totalSupplys = supplyResults.map(v => new BigNumber(v));

  return { tokenAddresses, balances, totalSupplys };
};

const getPoolPrice = (
  pool: BalancerPricePool,
  tokenAddresses: readonly Address[],
  balance: BigNumber[],
  totalSupply: BigNumber,
  tokenPrices: PricesById
): Record<string, StandardLpBreakdown> => {
  let tokenPrice;
  let tokenBalInUsd = new BigNumber(0);
  let totalStakedinUsd = new BigNumber(0);
  let shiftedBalances = [];
  let tokens = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    if (!pool.composable || i != pool.bptIndex) {
      // FIXME(unsafe-cast): checked previously; add typeguard
      const decimals = pool.tokens[i].decimals as string;
      tokenPrice = getTokenPrice(tokenPrices, pool.tokens[i].oracleId);
      tokenBalInUsd = balance[i].times(tokenPrice).dividedBy(decimals);
      totalStakedinUsd = totalStakedinUsd.plus(tokenBalInUsd);
      shiftedBalances.push(balance[i].dividedBy(decimals).toString(10));
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

export default getBalancerPrices;
