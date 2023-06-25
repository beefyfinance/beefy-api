import BigNumber from 'bignumber.js';

// json data
import { LpPool } from '../../../types/LpPool';
import _pools from '../../../data/matic/telxchangePools.json';
const pools = _pools as LpPool[];

import fetchPrice from '../../../utils/fetchPrice';
import { POLYGON_CHAIN_ID, QUICK_LPF } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { quickClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import IRewardPool from '../../../abis/IRewardPool';
const {
  polygon: {
    tokens: { TEL },
  },
} = addressBook;

const oracle = 'tokens';
const BLOCKS_PER_DAY = 28800;

export const getTelxchangeApys = async () => {
  const singleFarms = pools.filter(pool => pool.farmType === 'single');
  const pairAddresses = singleFarms.map(pool => pool.address);
  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF),
    getFarmApys(singleFarms),
  ]);

  return getApyBreakdown(singleFarms, tradingAprs, farmApys, QUICK_LPF);
};

const getFarmApys = async (pools: LpPool[]) => {
  const apys = [];
  const primaryRewardTokenPrice = await fetchPrice({ oracle, id: TEL.symbol });
  const [telDecimals] = [TEL].map(token => getEDecimals(token.decimals));
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy(pool.decimals);

    const yearlyRewards = rewardRates[i].times(3).times(BLOCKS_PER_DAY).times(365);
    const yearlyRewardsInUsd = yearlyRewards.times(primaryRewardTokenPrice).dividedBy(telDecimals);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async (pools: LpPool[]) => {
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, POLYGON_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([pool.rewardPool as `0x${string}`]));
    const rewardPool = fetchContract(pool.rewardPool, IRewardPool, POLYGON_CHAIN_ID);
    rewardRateCalls.push(rewardPool.read.rewardRate());
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(rewardRateCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const rewardRates = res[1].map(v => new BigNumber(v.toString()));
  return { balances, rewardRates };
};
