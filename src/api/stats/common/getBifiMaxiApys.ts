const BigNumber = require('bignumber.js');
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import IRewardPool from '../../../abis/IRewardPool';
import { ChainId } from '../../../../packages/address-book/address-book';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const { DAILY_HPY } = require('../../../constants');
const secondsPerYear = 31536000;

interface BifiApyParams {
  bifi: string; // address
  rewardPool: string; // address
  rewardId: string; // address
  rewardDecimals: string; // 1e18
  chain: string; // i.e. celo
  chainId: ChainId;
}

export const getBifiMaxiApys = async (params: BifiApyParams) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params),
    getTotalStakedInUsd(params),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee =
    1 - getTotalPerformanceFeeForVault(params.chain + '-bifi-maxi');
  const apy = compound(simpleApy, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return { [params.chain + '-bifi-maxi']: apy };
};

const getYearlyRewardsInUsd = async (params: BifiApyParams) => {
  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: params.rewardId });

  const rewardPool = fetchContract(params.rewardPool, IRewardPool, params.chainId);
  const rewardRate = new BigNumber((await rewardPool.read.rewardRate()).toString());
  const yearlyRewards =
    params.chain == 'ethereum'
      ? rewardRate.times(secondsPerYear).dividedBy(3)
      : rewardRate.times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy(params.rewardDecimals);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (params: BifiApyParams) => {
  const tokenContract = fetchContract(params.bifi, ERC20Abi, params.chainId);
  const totalStaked = new BigNumber(
    (await tokenContract.read.balanceOf([params.rewardPool as `0x${string}`])).toString()
  );
  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'oldBIFI' });

  return totalStaked.times(tokenPrice).dividedBy('1e18');
};
