import { ethereumWeb3 as web3 } from '../../../utils/web3';
import { getContractWithProvider } from '../../../utils/contractHelper';
import IApeStaking from '../../../abis/ethereum/ApeStaking.json';
import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';

const staking = '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9';

export const getApeStakingApy = async () => {
  const apeStaking = getContractWithProvider(IApeStaking, staking, web3);
  const poolsData = await apeStaking.methods.getPoolsUI().call();
  const totalSupply = new BigNumber(poolsData[0].stakedAmount);
  const periodFinish = Number(poolsData[0].currentTimeRange.endTimestampHour);
  const rewardsPerHour = new BigNumber(poolsData[0].currentTimeRange.rewardsPerHour);

  let apr = new BigNumber(0);
  if (periodFinish > Date.now() / 1000) {
    const totalRewards = rewardsPerHour.times(24).times(365);
    apr = totalRewards.div(totalSupply);
  }

  return getApyBreakdown([{ name: 'ape-ape', address: 'ape-ape' }], {}, [apr], 0);
};
