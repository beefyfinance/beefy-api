import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { parseAbi } from 'viem';
import { REAL_CHAIN_ID } from '../../../constants';
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

const tridentPools = require('../../../data/real/pearlTridentPools.json');
const stablePools = require('../../../data/real/pearlStableLpPools.json');
const volatilePools = require('../../../data/real/pearlLpPools.json');
const pools = [...tridentPools, ...stablePools, ...volatilePools];

const abi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function rewardsInfo() view returns (uint amount,uint disbursed,uint rewardRate,uint residueAmount,uint liquidity0rewards,uint periodFinish,uint lastUpdateTime)',
]);

export const getPearlApys = async () => {
  const rewardsCalls = [];
  const totalSupplyCalls = [];
  pools.forEach(p => {
    const contract = fetchContract(p.gauge, abi, REAL_CHAIN_ID);
    totalSupplyCalls.push(contract.read.totalSupply());
    if (p.name.startsWith('pearl-trident')) {
      rewardsCalls.push(contract.read.rewardsInfo());
    } else {
      rewardsCalls.push(contract.read.rewardRate());
    }
  });
  const [rewardsResults, totalSupplyResults] = await Promise.all([
    Promise.all(rewardsCalls),
    Promise.all(totalSupplyCalls),
  ]);

  const price = await fetchPrice({ oracle: 'tokens', id: 'PEARL' });
  const apys = [];
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const rewardRate = pool.name.startsWith('pearl-trident')
      ? new BigNumber(rewardsResults[i][2]).div('1e18')
      : new BigNumber(rewardsResults[i]).div('1e18');
    const totalSupply = new BigNumber(totalSupplyResults[i]).div('1e18');
    const apy = rewardRate.times(31536000).times(price).div(totalSupply.times(lpPrice));
    apys.push(apy);
    // console.log(pool.name, apy.toString(10), 'tvl', totalSupply.times(lpPrice).toString(10));
  }

  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: apys[i] })));
};
