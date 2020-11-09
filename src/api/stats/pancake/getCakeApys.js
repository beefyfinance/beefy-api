const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const SmartChef = require('../../../abis/SmartChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const getBaseCakeApy = require('./getBaseCakeApy');
const { getPrice } = require('../../../utils/getPrice');
const getTotalStakedInUsd = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/cakePools.json');

const web3 = new Web3(process.env.BSC_RPC);

const getCakeApys = async () => {
  const apys = {};
  const syrup = '0x009cF7bC57584b7998236eff51b98A168DceA9B0';

  const baseCakeApy = await getBaseCakeApy();

  for (const pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(pool.smartChef, pool.oracle, pool.oracleId, pool.decimals);
    const totalStakedInUsd = await getTotalStakedInUsd(pool.smartChef, syrup, 'coingecko', 'pancakeswap-token');
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).plus(baseCakeApy);
    apys[pool.name] = apy;
  }

  return apys;
};

const getYearlyRewardsInUsd = async (smartChefAddr, oracle, oracleId, decimals) => {
  const smartChefContract = new web3.eth.Contract(SmartChef, smartChefAddr);

  const currentBlock = await web3.eth.getBlockNumber();
  const bonusEndBlock = await smartChefContract.methods.bonusEndBlock().call();
  const isPoolRunning = currentBlock <= bonusEndBlock;

  if (!isPoolRunning) return new BigNumber(0);

  const blockRewards = new BigNumber(await smartChefContract.methods.rewardPerBlock().call());
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
  const earnedAssetPrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(earnedAssetPrice).dividedBy(decimals);
  return yearlyRewardsInUsd;
};

module.exports = getCakeApys;
