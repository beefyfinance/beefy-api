import BigNumber from 'bignumber.js';

import {
  MultiFeeDistribution,
  MultiFeeDistribution_ABI,
} from '../../../abis/common/MultiFeeDistribution';
import fetchPrice from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { BASE_HPY, BEEFY_PERFORMANCE_FEE, SHARE_AFTER_PERFORMANCE_FEE } from '../../../constants';
import Web3 from 'web3';
import { ApyBreakdownResult } from './getApyBreakdown';
import Token from '../../../../packages/address-book/types/token';

const oracle = 'tokens';

const BLOCKS_PER_DAY = 28800;

export interface MultiFeeDistributionSingleAssetApyParams {
  web3: Web3;
  multiFeeDistributionAddress: string;
  want: Token;
  output: Token;
  poolName: string;
}

const getMultiFeeDistributionSingleAssetApy = async (
  params: MultiFeeDistributionSingleAssetApyParams
) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params),
    getTotalStakedInUsd(params),
  ]);
  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  return getBreakdown(params.poolName, apr);
};

const getTotalStakedInUsd = async ({
  web3,
  multiFeeDistributionAddress,
  want,
}: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenContract = new web3.eth.Contract(
    MultiFeeDistribution_ABI,
    multiFeeDistributionAddress
  ) as unknown as MultiFeeDistribution;
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: want.symbol });
  return totalStaked.times(tokenPrice).dividedBy(want.decimals);
};

const getYearlyRewardsInUsd = async ({
  web3,
  multiFeeDistributionAddress,
  output,
}: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenPrice: number = await fetchPrice({ oracle, id: output.symbol });
  const rewardPool = new web3.eth.Contract(
    MultiFeeDistribution_ABI,
    multiFeeDistributionAddress
  ) as unknown as MultiFeeDistribution;
  const { rewardRate } = await rewardPool.methods.rewardData(output.address).call();
  const yearlyRewards = new BigNumber(rewardRate).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(output.decimals);

  return yearlyRewardsInUsd;
};

const getBreakdown = (poolName: string, apr: BigNumber): ApyBreakdownResult => {
  const result: ApyBreakdownResult = {
    apys: {},
    apyBreakdowns: {},
  };

  const vaultApr = apr.toNumber();
  const vaultApy = compound(vaultApr, BASE_HPY, 1, SHARE_AFTER_PERFORMANCE_FEE);
  const totalApy = vaultApy;

  result.apys[poolName] = totalApy;
  result.apyBreakdowns[poolName] = {
    compoundingsPerYear: BASE_HPY,
    beefyPerformanceFee: BEEFY_PERFORMANCE_FEE,
    vaultApr: vaultApr,
    vaultApy: vaultApy,
    totalApy: totalApy,
  };
  return result;
};

export default getMultiFeeDistributionSingleAssetApy;
