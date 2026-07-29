import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import { default as ICurvePool } from '../../../../abis/CurvePool.ts';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', platform: 'curve' });

const DECIMALS = '1e18';

export type CurvePriceToken = {
  oracleId?: string;
  decimals: string;
  basePool?: string;
};

export type CurvePricePool = {
  name: string;
  pool: string;
  token?: string;
  tokens: CurvePriceToken[];
};

type CurvePriceTokenData = {
  poolName: string;
  oracleId: string | undefined;
  token: CurvePriceToken;
};

type CurvePoolSupplyInfo = {
  pool: string;
  totalSupply: BigNumber;
};

const getCurvePricesCommon = async (chainId: ChainId, pools: CurvePricePool[], tokenPrices: PricesById) => {
  let prices: Record<string, StandardLpBreakdown> = {};

  //Split needed pool data and calls
  const poolData = pools.map(pool => pool.pool);
  const supplyCalls = pools.map(pool => {
    const contract = fetchContract(pool.token ?? pool.pool, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });

  //Split needed token data and calls
  const tokenData: CurvePriceTokenData[] = [],
    tokenBalanceCalls: Promise<bigint>[] = [],
    tokenAddressCalls: Promise<Address>[] = [];
  pools.forEach(pool => {
    const contract = fetchContract(pool.pool, ICurvePool, chainId);
    pool.tokens.forEach((token, index) => {
      tokenData.push({
        poolName: pool.name,
        oracleId: token.oracleId,
        token,
      });
      tokenBalanceCalls.push(contract.read.balances([BigInt(index)]));
      tokenAddressCalls.push(contract.read.coins([BigInt(index)]));
    });
  });

  //Single await for all calls
  const [balanceResults, addressResults, supplyResults] = await Promise.all([
    Promise.all(tokenBalanceCalls),
    Promise.all(tokenAddressCalls),
    Promise.all(supplyCalls),
  ]);

  //Build token result object
  const tokensInfo = balanceResults.map((_, index) => {
    return {
      ...tokenData[index],
      balance: new BigNumber(balanceResults[index]),
      address: addressResults[index],
    };
  });
  //Build supply result object
  const poolsInfo: CurvePoolSupplyInfo[] = supplyResults.map((totalSupply, index) => {
    return {
      pool: poolData[index],
      totalSupply: new BigNumber(totalSupply),
    };
  });

  // reverse to calc base pools (3pool, fraxbp) first and use their prices in metapools
  for (const pool of pools.slice().reverse()) {
    // FIXME(unsafe-cast): checked previously; add typeguard
    const supplyInfo = poolsInfo.find(r => r.pool === pool.pool) as CurvePoolSupplyInfo;
    const totalSupply = supplyInfo.totalSupply.div(DECIMALS);
    const tokens = tokensInfo.filter(r => r.poolName === pool.name);

    let totalBalInUsd = new BigNumber(0);
    for (const t of tokens) {
      const price = getTokenPrice(prices, tokenPrices, t.token);
      const usdBalance = t.balance.times(price).div(t.token.decimals);
      totalBalInUsd = totalBalInUsd.plus(usdBalance);
    }
    let price = totalBalInUsd.div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: tokens.map(t => t.address),
      balances: tokens.map(t => t.balance.div(t.token.decimals).toString(10)),
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (
  lpPrices: Record<string, StandardLpBreakdown>,
  tokenPrices: PricesById,
  token: CurvePriceToken
) => {
  if (token.basePool) {
    const basePool = lpPrices[token.basePool];
    if (basePool) return basePool.price;
    else logger.warn({ basePool: token.basePool }, 'no basePool price, move it to the bottom');
  }
  if (!token.oracleId) {
    logger.warn({ token }, 'oracleId is not defined');
    return 1;
  }
  let tokenPrice = 1;
  const tokenSymbol = token.oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ token: tokenSymbol }, 'unknown token, consider adding it to json config');
  }
  return tokenPrice;
};

export default getCurvePricesCommon;
