import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

import IRewardPool from '../../../abis/matic/StakingMultiRewards.json';
import ERC20 from '../../../abis/ERC20.json';
import fetchPrice from '../../../utils/fetchPrice';
import pools from '../../../data/matic/comethMultiLpPools.json';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { quickClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const {
  polygon: {
    tokens: { TEL, QUICK },
  },
} = addressBook;

const oracle = 'tokens';

const BLOCKS_PER_DAY = 28800;

export const getTelxchangeDualApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const primaryRewardTokenPrice = await fetchPrice({ oracle, id: TEL.symbol });
  const secondRewardTokenPrice = await fetchPrice({ oracle, id: QUICK.symbol });
  const [telDecimals, quickDecimals] = [TEL, QUICK].map(token => getEDecimals(token.decimals));
  const { balances, rewardRates, secondRewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = rewardRates[i].times(3).times(BLOCKS_PER_DAY).times(365);
    const secondYearlyRewards = secondRewardRates[i].times(3).times(BLOCKS_PER_DAY).times(365);
    const yearlyRewardsInUsd = yearlyRewards.times(primaryRewardTokenPrice).dividedBy(telDecimals);
    const secondYearlyRewardsInUsd = secondYearlyRewards
      .times(secondRewardTokenPrice)
      .dividedBy(quickDecimals);
    const rewards = yearlyRewardsInUsd.plus(secondYearlyRewardsInUsd);

    apys.push(rewards.dividedBy(totalStakedInUsd));
  }
  return apys;
};

const getPoolsData = async pools => {
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  const secondRewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRates(0),
    });
    secondRewardRateCalls.push({
      secondRewardRate: rewardPool.methods.rewardRates(1),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls, secondRewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  const secondRewardRates = res[2].map(v => new BigNumber(v.secondRewardRate));
  return { balances, rewardRates, secondRewardRates };
};
