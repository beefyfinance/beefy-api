import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { parseAbi } from 'viem';
import { BASE_HPY, REAL_CHAIN_ID } from '../../../constants';
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

const pools = require('../../../data/real/pearlTridentPools.json');

const abi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewardsInfo() view returns (uint amount,uint disbursed,uint rewardRate,uint residueAmount,uint liquidity0rewards,uint periodFinish,uint lastUpdateTime)',
]);

export const getPearlApys = async () => {
  const rewardsCalls = [];
  const totalSupplyCalls = [];
  pools.forEach(p => {
    const contract = fetchContract(p.gauge, abi, REAL_CHAIN_ID);
    rewardsCalls.push(contract.read.rewardsInfo());
    totalSupplyCalls.push(contract.read.totalSupply());
  });
  const [rewardsResults, totalSupplyResults, points] = await Promise.all([
    Promise.all(rewardsCalls),
    Promise.all(totalSupplyCalls),
    fetch('https://api.tangible.store/points-apy?project=pearl')
      .then(r => r.json())
      .catch(_ => {}),
  ]);

  const price = await fetchPrice({ oracle: 'tokens', id: 'PEARL' });
  const apys = [];
  const pointsApys = [];
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const rewardRate = new BigNumber(rewardsResults[i][2]).div('1e18');
    const totalSupply = new BigNumber(totalSupplyResults[i]).div('1e18');
    const apy = rewardRate.times(31536000).times(price).div(totalSupply.times(lpPrice));
    apys.push(apy);
    const pointsData = points?.data?.find(r => r?.address?.toLowerCase() === pool.address.toLowerCase());
    pointsApys.push(Number(pointsData?.apy || 0) / 100);
  }

  return getApyBreakdown(
    pools.map((p, i) => ({
      vaultId: p.name,
      vault: apys[i],
      rewardPool: 0,
      // rewardPool: pointsApys[i],
      compoundingsPerYear: BASE_HPY,
    }))
  );
};
