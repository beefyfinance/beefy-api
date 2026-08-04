import { BigNumber } from 'bignumber.js';
import type { Abi } from 'viem';
import type { StandardLpBreakdown } from '../../../../types/prices.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';
import type { AaveV4Pool } from './getAaveV4Apys.ts';

const logger = getLoggerFor({ module: 'prices', component: 'aave-v4' });

const ISpokeAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'reserveId', type: 'uint256' }],
    name: 'getReserveSuppliedAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export const getAaveV4Prices = withTracing(
  async (chainId: number, pools: AaveV4Pool[], tokenPrices: Record<string, number>) => {
    const supplyCalls = pools.map(pool =>
      fetchContract(pool.spoke, ISpokeAbi, chainId).read.getReserveSuppliedAssets([BigInt(pool.reserveId)])
    );
    const supplyRes = await Promise.all(supplyCalls);
    const prices: Record<string, StandardLpBreakdown> = {};

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const price = tokenPrices[pool.oracleId] || 0;
      const totalSupply = new BigNumber(supplyRes[i].toString()).div(pool.decimals).toString(10);

      prices[pool.name] = {
        price,
        totalSupply,
        tokens: [],
        balances: [],
      };
    }

    return prices;
  },
  { logger, fieldsFn: (chainId: number) => ({ chain: chainId }) }
);
