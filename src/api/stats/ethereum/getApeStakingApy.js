import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import IApeStaking from '../../../abis/ethereum/ApeStaking';
import { fetchContract } from '../../rpc/client';
import { ETH_CHAIN_ID } from '../../../constants';

const staking = '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9';

export const getApeStakingApy = async () => {
  const apeStaking = fetchContract(staking, IApeStaking, ETH_CHAIN_ID);
  const poolsData = await apeStaking.read.getPoolsUI();
  const totalSupply = new BigNumber(poolsData[0].stakedAmount.toString());
  const periodFinish = Number(poolsData[0].currentTimeRange.endTimestampHour);
  const rewardsPerHour = new BigNumber(poolsData[0].currentTimeRange.rewardsPerHour);

  let apr = new BigNumber(0);
  if (periodFinish > Date.now() / 1000) {
    const totalRewards = rewardsPerHour.times(24).times(365);
    apr = totalRewards.div(totalSupply);
  }

  return getApyBreakdown([{ name: 'ape-ape', address: 'ape-ape' }], {}, [apr], 0);
};
