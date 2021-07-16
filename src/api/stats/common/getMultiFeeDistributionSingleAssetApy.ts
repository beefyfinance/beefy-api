import BigNumber from 'bignumber.js';

import {
  MultiFeeDistribution,
  MultiFeeDistribution_ABI,
} from '../../../abis/common/MultiFeeDistribution';
import fetchPrice from '../../../utils/fetchPrice';
import { compound } from '../../../utils/compound';
import { BASE_HPY } from '../../../constants';
import Web3 from 'web3';

const oracle = 'tokens';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

interface MultiFeeDistributionSingleAssetApyParams {
  web3: Web3;
  multiFeeDistributionAddress: string;
  wantTokenOracleId: string;
  outputTokenOracleId: string;
  outputTokenAddress: string;
  poolName: string;
}

const getMultiFeeDistributionSingleAssetApy = async (
  params: MultiFeeDistributionSingleAssetApyParams
) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params),
    getTotalStakedInUsd(params),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  return { [params.poolName]: apy };
};

const getTotalStakedInUsd = async (params: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenContract = new params.web3.eth.Contract(
    MultiFeeDistribution_ABI,
    params.multiFeeDistributionAddress
  ) as unknown as MultiFeeDistribution;
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: params.wantTokenOracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (params: MultiFeeDistributionSingleAssetApyParams) => {
  const tokenPrice: number = await fetchPrice({ oracle, id: params.outputTokenOracleId });
  const rewardPool = new params.web3.eth.Contract(
    MultiFeeDistribution_ABI,
    params.multiFeeDistributionAddress
  ) as unknown as MultiFeeDistribution;
  const { rewardRate } = await rewardPool.methods.rewardData(params.outputTokenAddress).call();
  const yearlyRewards = new BigNumber(rewardRate).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

export default getMultiFeeDistributionSingleAssetApy;
