import BigNumber from 'bignumber.js';

import {
  MultiFeeDistribution,
  MultiFeeDistribution_ABI,
} from '../../../abis/common/MultiFeeDistribution';
import fetchPrice from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { BASE_HPY } from '../../../constants';
import Web3 from 'web3';
import { ApyBreakdownResult } from './getApyBreakdown';
import Token from '../../../../packages/address-book/types/token';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

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
  const tokenContract = getContractWithProvider(
    MultiFeeDistribution_ABI,
    multiFeeDistributionAddress,
    web3
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
  const rewardPool = getContractWithProvider(
    MultiFeeDistribution_ABI,
    multiFeeDistributionAddress,
    web3
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
  const beefyPerformanceFee = getTotalPerformanceFeeForVault(poolName);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const vaultApy = compound(vaultApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const totalApy = vaultApy;

  result.apys[poolName] = totalApy;
  result.apyBreakdowns[poolName] = {
    vaultApr: vaultApr,
    vaultApy: vaultApy,
    totalApy: totalApy,
    compoundingsPerYear: BASE_HPY,
    beefyPerformanceFee: beefyPerformanceFee,
  };
  return result;
};

export default getMultiFeeDistributionSingleAssetApy;
