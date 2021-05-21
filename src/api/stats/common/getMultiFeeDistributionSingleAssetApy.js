const BigNumber = require('bignumber.js');

const MultiFeeDistribution = require('../../../abis/MultiFeeDistribution.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const oracle = 'tokens';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMultiFeeDistributionSingleAssetApy = async params => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(params),
    getTotalStakedInUsd(params),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [params.poolName]: apy };
};

const getTotalStakedInUsd = async params => {
  const tokenContract = new params.web3.eth.Contract(
    MultiFeeDistribution,
    params.multiFeeDistributionAddress
  );
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: params.wantTokenOracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async params => {
  const tokenPrice = await fetchPrice({ oracle, id: params.outputTokenOracleId });

  const rewardPool = new params.web3.eth.Contract(
    MultiFeeDistribution,
    params.multiFeeDistributionAddress
  );
  const { rewardRate } = await rewardPool.methods.rewardData(params.outputTokenAddress).call();
  const yearlyRewards = new BigNumber(rewardRate).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getMultiFeeDistributionSingleAssetApy;
