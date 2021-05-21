const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const MultiFeeDistribution = require('../../../abis/MultiFeeDistribution.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const multiFeeDistribution = '0x4076CC26EFeE47825917D0feC3A79d0bB9a6bB5c';
const oracle = 'tokens';
const oracleId = 'EPS';

const outputOracleId = 'BUSD';
const outputTokenAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const poolName = 'ellipsis-eps';

const getEllipsisSingleAssetApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [poolName]: apy };
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(MultiFeeDistribution, multiFeeDistribution);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: outputOracleId });

  const rewardPool = new web3.eth.Contract(MultiFeeDistribution, multiFeeDistribution);
  const { rewardRate } = await rewardPool.methods.rewardData(outputTokenAddress).call();
  const yearlyRewards = new BigNumber(rewardRate).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getEllipsisSingleAssetApy;
