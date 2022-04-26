import BigNumber from 'bignumber.js';
import { cronosWeb3 as web3 } from '../../../utils/web3';

import IRewardPool from '../../../abis/IRewardPool.json';
import { ERC20, ERC20_ABI } from '../../../abis/common/ERC20';
import fetchPrice from '../../../utils/fetchPrice';
import { getContractWithProvider } from '../../../utils/contractHelper';

const BIFI = '0xe6801928061CDbE32AC5AD0634427E140EFd05F9';
const REWARDS = '0x107Dbf9c9C0EF2Df114159e5C7DC2baf7C444cFF';
const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const DECIMALS = '1e18';
const SECONDS_PER_YEAR = 31536000;

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

  const rewardPool = getContractWithProvider(IRewardPool as any, REWARDS, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(SECONDS_PER_YEAR);
  const yearlyRewardsInUsd = yearlyRewards.times(celoPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const tokenContract = getContractWithProvider(ERC20_ABI, BIFI, web3) as unknown as ERC20;
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(REWARDS).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};
