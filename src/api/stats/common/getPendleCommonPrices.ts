import { BigNumber } from 'bignumber.js';
import { type Address, parseAbi } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import {
  ARBITRUM_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  PLASMA_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../../constants.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import type { OptionalRecord } from '../../../utils/object.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'pendle' });

const routerStatic = {
  [ARBITRUM_CHAIN_ID]: '0xAdB09F65bd90d19e3148D9ccb693F3161C6DB3E8',
  [ETH_CHAIN_ID]: '0x263833d47eA3fA4a30f269323aba6a107f9eB14C',
  [BSC_CHAIN_ID]: '0x2700ADB035F82a11899ce1D3f1BF8451c296eABb',
  [BASE_CHAIN_ID]: '0xB4205a645c7e920BD8504181B1D7f2c5C955C3e7',
  [SONIC_CHAIN_ID]: '0x0013ACc071f732fd6BF8210AB46A3794a7D8945e',
  [PLASMA_CHAIN_ID]: '0x6813d43782395A1F2AAb42f39aeEDE03ac655e09',
};
const routerAbi = parseAbi([
  'function isExpired() external view returns (bool)',
  'function readState(address router) external view returns (uint pt, uint sy, uint lp)',
  'function getLpToAssetRate(address market) external view returns (uint256)',
]);

export type PendlePool = {
  name: string;
  address: string;
  decimals: string;
  oracle?: string;
  oracleId?: string;
};

type PendleChainId =
  | typeof ARBITRUM_CHAIN_ID
  | typeof ETH_CHAIN_ID
  | typeof BSC_CHAIN_ID
  | typeof BASE_CHAIN_ID
  | typeof SONIC_CHAIN_ID
  | typeof PLASMA_CHAIN_ID;

export const getPendleCommonPrices = async (
  chainId: PendleChainId,
  pools: PendlePool[],
  tokenPrices: PricesById,
  lpPrices?: PricesById
) => {
  let prices: Record<string, StandardLpBreakdown> = {};

  const isExpired = pools.map(p => {
    const old: OptionalRecord<string, string> = {
      'equilibria-arb-seth': '26dec24',
      'equilibria-arb-reth': '26jun25',
    };
    const date = old[p.name] || p.name.split('-').pop();
    const timestamp = Date.parse(`${date} UTC`) || 0;
    if (timestamp === 0) logger.warn({ pool: p.name }, 'no expiry date');
    return Date.now() > timestamp;
  });
  const supplyCalls = pools.map(pool => fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply());
  const lpRatesCalls = pools.map(async (pool, i) => {
    const router = routerStatic[chainId];
    const market = pool.address as Address;
    if (isExpired[i]) {
      try {
        return await fetchContract(router, routerAbi, chainId).read.getLpToAssetRate([market]);
      } catch (e) {
        logger.warn({ chain: chainId, pool: pool.name, err: e }, 'lpToAssetRate failed');
        const [pt, sy, lp] = await fetchContract(market, routerAbi, chainId).read.readState([router as Address]);
        return new BigNumber(pt).plus(sy).times('1e18').div(lp);
      }
    }
    return fetchContract(router, routerAbi, chainId).read.getLpToAssetRate([market]);
  });
  const [supplyResults, lpRates] = await Promise.all([Promise.all(supplyCalls), Promise.all(lpRatesCalls)]);

  const poolsData = supplyResults.map((_, i) => {
    return {
      lpRate: new BigNumber(lpRates[i]),
      totalSupply: new BigNumber(supplyResults[i]),
    };
  });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpRate = poolsData[i].lpRate;
    // console.log(pool.name, 'lpRate', lpRate.div('1e18').valueOf());
    // FIXME(unsafe-cast): may be undefined
    const underlyingPrice = getUnderlyingPrice(pool, tokenPrices, lpPrices as PricesById);
    const price = lpRate.times(underlyingPrice).div(pool.decimals).toNumber();
    const totalSupply = poolsData[i].totalSupply.div('1e18').toString(10);
    prices[pool.name] = { price, totalSupply, tokens: [], balances: [] };

    // console.log(pool.name, 'tvl', poolsData[i].totalSupply.div(pool.decimals).times(price).toNumber());
  }
  return prices;
};

const getUnderlyingPrice = (pool: PendlePool, tokenPrices: PricesById, lpPrices: PricesById) => {
  const oracle = pool.oracle;
  const oracleId = pool.oracleId;
  if (!oracle || !oracleId) {
    logger.warn({ pool: pool.name }, 'no oracle or oracleId');
    return 1;
  }
  let tokenPrice = 1;
  if (oracle === 'lps') {
    if (lpPrices.hasOwnProperty(oracleId)) {
      tokenPrice = lpPrices[oracleId];
    } else {
      logger.warn({ oracleId }, 'unknown lp price');
    }
  } else {
    if (tokenPrices.hasOwnProperty(oracleId)) {
      tokenPrice = tokenPrices[oracleId];
    } else {
      logger.warn({ oracleId }, 'unknown token price');
    }
  }
  return tokenPrice;
};
