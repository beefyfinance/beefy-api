import BigNumber from 'bignumber.js';
import { parseAbi } from 'viem';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import { ETH_CHAIN_ID as chainId } from '../../../constants.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { BIGINT_UNIT_18 } from '../../../utils/big-int.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';
import pools from '../../../data/ethereum/ybPools.json' with { type: 'json' };

const abi = parseAbi([
  'function previewRedeem(uint shares) view returns (uint)',
  'function preview_withdraw(uint shares) view returns (uint)',
]);

export async function getYieldBasisPrices(tokenPrices: PricesById) {
  let prices: Record<string, StandardLpBreakdown> = {};

  const gaugeToYbCalls = pools.map(p => fetchContract(p.gauge, abi, chainId).read.previewRedeem([BIGINT_UNIT_18]));
  const ybToAssetCalls = pools.map(p => fetchContract(p.address, abi, chainId).read.preview_withdraw([BIGINT_UNIT_18]));
  const supplyCalls = pools.map(p => fetchContract(p.gauge, ERC20Abi, chainId).read.totalSupply());
  const [gaugePpsRes, ybPpsRes, supplyRes] = await Promise.all([
    Promise.all(gaugeToYbCalls),
    Promise.all(ybToAssetCalls),
    Promise.all(supplyCalls),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const gaugePps = new BigNumber(gaugePpsRes[i]).div('1e18');
    const pps = new BigNumber(ybPpsRes[i]).div(pool.decimals);
    const tokenPrice = getTokenPrice(tokenPrices, pool.oracleId);
    const price = gaugePps.times(pps).times(tokenPrice).toNumber();
    const totalSupply = new BigNumber(supplyRes[i]).div('1e18').toString(10);
    // console.log(`YB ${pool.name} tokenPrice: ${tokenPrice} price: ${price}`);
    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [],
      balances: [],
    };
  }
  return prices;
}

const getTokenPrice = (tokenPrices: PricesById, oracleId: string | undefined) => {
  const logger = getLoggerFor({ module: 'apy', platform: 'yieldbasis' });
  if (!oracleId) {
    logger.warn('oracleId is not defined');
    return 1;
  }
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    logger.warn(`Unknown token price '${tokenSymbol}'`);
  }
  return tokenPrice;
};
