const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/comethLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../constants');

const oracle = 'tokens';
const oracleId = 'MUST';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const usdcMustRewardPool = '0x1C678EA856B368CC361A3389734fe451fEC8CEea'; // USDC-MUST
const maticMustRewardPool = '0x2328c83431a29613b1780706E0Af3679E3D04afd'; // MATIC-MUST
const ethMaticRewardPool = '0x5A25c4f43d0bfcCc07Aa86f7e8a1a1A3bFd9b15d'; // ETH-MATIC


const getComethLpApys = async () => {
  let poolUsdcMust = pools.filter(pool => pool.name === 'cometh-usdc-must')[0];
  let poolMaticMust = pools.filter(pool => pool.name === 'cometh-matic-must')[0];
  let poolEthMatic = pools.filter(pool => pool.name === 'cometh-eth-matic')[0];

  const values = await Promise.all([
    getPoolApy(usdcMustRewardPool, poolUsdcMust, 137),
    getPoolApy(maticMustRewardPool, poolMaticMust, 137),
    getPoolApy(ethMaticRewardPool, poolEthMatic, 137),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool, chainId) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool, chainId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async RewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, RewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getComethLpApys;