import type { Abi } from 'abitype';
import BigNumber from 'bignumber.js';
import { fetchContract } from '../../../rpc/client';
import type { AaveV4Pool } from './getAaveV4Apys';

const ISpokeAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'reserveId', type: 'uint256' }],
    name: 'getReserveSuppliedAssets',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

export const getAaveV4Prices = async (chainId: number, pools: AaveV4Pool[], tokenPrices: Record<string, number>) => {
  const supplyCalls = pools.map(pool =>
    fetchContract(pool.spoke, ISpokeAbi, chainId).read.getReserveSuppliedAssets([BigInt(pool.reserveId)])
  );
  const supplyRes = await Promise.all(supplyCalls);
  const prices = {};

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
};
