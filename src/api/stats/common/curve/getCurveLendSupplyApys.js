import { parseAbi } from 'viem';
import { compound } from '../../../../utils/compound';

const { fetchContract } = require('../../../rpc/client');
const BigNumber = require('bignumber.js');

const ICurveVault = parseAbi(['function lend_apr() view returns (uint)']);

export const getCurveLendSupplyApys = async (chainId, pools) => {
  const apys = {};

  const lendAprs = await Promise.all(
    pools.map(pool => fetchContract(pool.address, ICurveVault, chainId).read.lend_apr())
  );
  pools.forEach((pool, i) => {
    apys[pool.name] = new BigNumber(compound(new BigNumber(lendAprs[i]).div('1e18')));
  });

  return apys;
};
