const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/quickLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const oracle = 'tokens';
const oracleId = 'QUICK';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const maticQuickRewardPool = '0x7Ca29F0DB5Db8b88B332Aa1d67a2e89DfeC85E7E'; // Matic-Quick
const ethMaticRewardPool = '0x8FF56b5325446aAe6EfBf006a4C1D88e4935a914'; // Eth-Matic
const ethBtcRewardPool = '0x070D182EB7E9C3972664C959CE58C5fC6219A7ad'; // Eth-Btc
const ethUsdtRewardPool = '0xB26bfcD52D997211C13aE4C35E82ced65AF32A02'; // Eth-Usdt

const getQuickLpApys = async () => {
  let poolMaticQuick = pools.filter(pool => pool.name === 'quick-quick-matic')[0];
  let poolEthMatic = pools.filter(pool => pool.name === 'quick-eth-matic')[0];
  let poolEthBtc = pools.filter(pool => pool.name === 'quick-eth-btc')[0];
  let poolEthUsdt = pools.filter(pool => pool.name === 'quick-eth-usdt')[0];

  const values = await Promise.all([
    getPoolApy(maticQuickRewardPool, poolMaticQuick, 137),
    getPoolApy(ethMaticRewardPool, poolEthMatic, 137),
    getPoolApy(ethBtcRewardPool, poolEthBtc, 137),
    getPoolApy(ethUsdtRewardPool, poolEthUsdt, 137),
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

module.exports = getQuickLpApys;