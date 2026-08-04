import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { parseAbi } from 'viem';
import { compound } from '../../../../utils/compound.ts';
import { fetchContract } from '../../../rpc/client.ts';

const ICurveVault = parseAbi(['function lend_apr() view returns (uint)']);

export type CurveLendPool = {
  name: string;
  address?: string;
};

export const getCurveLendSupplyApys = async (chainId: ChainId, pools: CurveLendPool[]) => {
  const apys: Record<string, BigNumber> = {};

  // FIXME(unsafe-cast): checked previously; add typeguard
  const lendAprs = await Promise.all(
    pools.map(pool => fetchContract(pool.address as string, ICurveVault, chainId).read.lend_apr())
  );
  pools.forEach((pool, i) => {
    apys[pool.name] = new BigNumber(compound(new BigNumber(lendAprs[i]).div('1e18').toNumber()));
  });

  return apys;
};
