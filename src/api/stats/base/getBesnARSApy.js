import { IBeefyRewardPool } from '../../../abis/IBeefyRewardPool';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import { addressBook } from '../../../../packages/address-book/src/address-book';
import { BASE_CHAIN_ID } from '../../../constants';
import { fetchPrice } from '../../../utils/fetchPrice';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

const BigNumber = require('bignumber.js');
const secondsPerYear = 31536000;
const {
  base: {
    tokens: { besnARS },
  },
} = addressBook;

const rewards = [
  {
    symbol: 'USDC',
    id: 0,
    decimals: '1e6',
  },
];

const rewardPool = '0xf375F32bc750C37BA091eD359791B014F7145825';

export const getBesnARSApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return getApyBreakdown({
    vaultId: 'beefy-snars-pool',
    beefyFee: 0,
    rewardPool: apr,
  });
};

const getYearlyRewardsInUsd = async () => {
  let yearlyRewards = new BigNumber(0);
  const rewardPoolContract = fetchContract(rewardPool, IBeefyRewardPool, BASE_CHAIN_ID);
  for (let i = 0; i < rewards.length; ++i) {
    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewards[i].symbol });
    const rewardInfo = await rewardPoolContract.read.rewardInfo([rewards[i].id]);
    const rewardRate = new BigNumber(rewardInfo[4].toString());
    const periodFinish = new BigNumber(rewardInfo[1].toString());
    if (periodFinish.isGreaterThan(Math.floor(Date.now() / 1000))) {
      yearlyRewards = yearlyRewards.plus(
        rewardRate.times(secondsPerYear).times(rewardPrice).dividedBy(rewards[i].decimals)
      );
    }
  }
  return yearlyRewards;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = fetchContract(besnARS.address, ERC20Abi, BASE_CHAIN_ID);
  const totalStaked = new BigNumber((await tokenContract.read.balanceOf([rewardPool])).toString());
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'besnARS' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};
