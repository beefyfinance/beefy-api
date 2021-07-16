import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

// abis
import { StakingRewards, StakingRewards_ABI } from '../../../abis/matic/Telxchange/StakingRewards';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
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
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, QUICK_LPF);
  const farmApys = await getFarmApys(singleFarms);

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
  const multicall = new MultiCall(web3 as any, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, pool.address) as unknown as ERC20;
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    const rewardPool = new web3.eth.Contract(
      StakingRewards_ABI,
      pool.rewardPool
    ) as unknown as StakingRewards;
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRate(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};
