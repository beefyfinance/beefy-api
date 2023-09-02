const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
import getApyBreakdown from '../../common/getApyBreakdown';
import { BSC_CHAIN_ID as chainId } from '../../../../constants';
import { addressBook } from '../../../../../packages/address-book/address-book';
import { fetchContract } from '../../../rpc/client';
import getBlockTime from '../../../../utils/getBlockTime';
import { getEDecimals } from '../../../../utils/getEDecimals';
import IOOEStaking from '../../../../abis/bsc/IOOEStaking';
import pools from '../../../../data/bsc/ooeV2LpPools.json';

const {
  bsc: {
    tokens: { OOEV2 },
  },
} = addressBook;

export const getOOELpApys = async () => {
  const [farmApys] = await Promise.all([getFarmApys()]);

  return getApyBreakdown(pools, {}, farmApys, 0.003);
};

const getFarmApys = async () => {
  const apys = [];

  const [rewardTokenPrice, { balances, rewardRates }, secondsPerBlock] = await Promise.all([
    fetchPrice({ oracle: 'tokens', id: OOEV2.symbol }),
    getPoolsData(),
    getBlockTime(chainId),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle: 'lps', id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const secondsPerYear = 31536000;
    const yearlyRewards = rewardRates[i].times(secondsPerYear).dividedBy(secondsPerBlock);
    const yearlyRewardsInUsd = yearlyRewards
      .times(rewardTokenPrice)
      .dividedBy(getEDecimals(OOEV2.decimals));

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async () => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const rewardPool = fetchContract(pool.rewardPool, IOOEStaking, chainId);
    balanceCalls.push(rewardPool.read.totalCollateral());
    rewardRateCalls.push(rewardPool.read.rewardSpeed());
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(rewardRateCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  return { balances, rewardRates };
};

module.exports = { getOOELpApys };
