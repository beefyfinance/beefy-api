import BigNumber from 'bignumber.js';
import { cronosWeb3 as web3 } from '../../../utils/web3';

import IRewardPool from '../../../abis/IRewardPool.json';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';

import fetchPrice from '../../../utils/fetchPrice';
import getBlockTime from '../../../utils/getBlockTime';

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';

export const getCronosBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'cronos-bifi-gov': apr,
    },
    apyBreakdowns: {
      'cronos-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const celoPrice = await fetchPrice({ oracle: ORACLE, id: 'WCRO' });

  const secondsPerYear = new BigNumber(31536000);
  const secondsPerBlock = await getBlockTime(25);
  const blocksPerDay = new BigNumber(secondsPerYear.dividedBy(secondsPerBlock));

  const rewardPool = new web3.eth.Contract(IRewardPool as any, REWARDS);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(blocksPerDay).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(celoPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(ERC20_ABI, BIFI) as unknown as ERC20;
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};
