const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const AddyMultiFeeDistribution = require('../../../abis/matic/AddyMultiFeeDistribution.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');

const multiFeeDistribution = '0x920f22E1e5da04504b765F8110ab96A20E6408Bd'; // MultiFeeDistribution contract
const oracle = 'tokens';
const oracleId = 'ADDY';
const addyTokenAddress = '0xc3fdbadc7c795ef1d6ba111e06ff8f16a20ea539';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAddyApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { 'adamant-addy': apy };
};

const getTotalStakedInUsd = async () => {
  const tokenContract = new web3.eth.Contract(AddyMultiFeeDistribution, multiFeeDistribution);
  const totalStaked = new BigNumber(await tokenContract.methods.totalSupply().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(AddyMultiFeeDistribution, multiFeeDistribution);
  const { rewardRate } = await rewardPool.methods.rewardData(addyTokenAddress).call();
  const yearlyRewards = new BigNumber(rewardRate).times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getAddyApy;
