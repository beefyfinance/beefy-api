import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import simpleFarmABI from '../../../abis/ISimpleFarm.json';
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from './getApyBreakdownNew';

export const getMellowVeloApys = async (chainId, pools) => {
  const price = await fetchPrice({ oracle: 'tokens', id: 'VELO' });

  const contracts = pools.map(p => fetchContract(p.gauge, simpleFarmABI, chainId));
  const [rewardRates, totalSupplies] = await Promise.all([
    Promise.all(contracts.map(c => c.read.rewardRate().then(v => new BigNumber(v)))),
    Promise.all(contracts.map(c => c.read.totalSupply().then(v => new BigNumber(v)))),
  ]);

  const apys = [];
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = totalSupplies[i].times(lpPrice).div('1e18');
    const rewardsInUsd = rewardRates[i].times(31536000).times(price).div('1e18');
    const apy = rewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, 'tvl', totalStakedInUsd.toString(10), 'apy', apy.toString(10))
  }

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: apys[i] })));
};
