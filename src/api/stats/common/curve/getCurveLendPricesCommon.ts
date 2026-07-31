import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { parseAbi } from 'viem';
import { default as ERC20Abi } from '../../../../abis/ERC20Abi.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'curve-lend' });

const ICurveVault = parseAbi(['function pricePerShare() view returns (uint)']);

export type CurveLendPricePool = {
  name: string;
  address: string;
  oracleId?: string;
};

export const getCurveLendPricesCommon = async (
  chainId: ChainId,
  pools: CurveLendPricePool[],
  tokenPrices: PricesById
) => {
  let prices: Record<string, StandardLpBreakdown> = {};

  const ppsCalls = pools.map(pool => fetchContract(pool.address, ICurveVault, chainId).read.pricePerShare());
  const supplyCalls = pools.map(pool => fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply());
  const [ppsRes, supplyRes] = await Promise.all([Promise.all(ppsCalls), Promise.all(supplyCalls)]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const pps = new BigNumber(ppsRes[i]).div('1e18');
    const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);
    const price = pps.times(tokenPrice).toNumber();
    const totalSupply = new BigNumber(supplyRes[i]).div('1e18').toString(10);
    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [],
      balances: [],
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices: PricesById, oracleId: string | undefined) => {
  if (!oracleId) {
    logger.warn('lend prices oracleId is not defined');
    return 1;
  }
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn({ token: tokenSymbol }, 'unknown token, consider adding it to json config');
  }
  return tokenPrice;
};
