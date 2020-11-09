const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const SmartGangster = require('../../../abis/SmartGangster.json');
const ERC20 = require('../../../abis/ERC20.json');
const getBaseDrugsApy = require('./getBaseDrugsApy');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/drugsPools.json');

const web3 = new Web3(process.env.BSC_RPC);

const getDrugsApys = async () => {
  const apys = {};
  const hoes = '0x8191113581cBfa3fcdC6B0d2e6F84753D4850080';

  const baseDrugsApy = await getBaseDrugsApy();

  for (const pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(
      pool.smartGangster,
      pool.oracle,
      pool.oracleId,
      pool.decimals
    );
    const totalStakedInUsd = await getTotalStakedInUsd(pool.smartGangster, 'pancake', 'DRUGS', hoes);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).plus(baseDrugsApy);
    apys[pool.name] = apy;
  }

  return apys;
};

const getYearlyRewardsInUsd = async (smartGangsterAddr, oracle, oracleId, decimals) => {
  const smartGangsterContract = new web3.eth.Contract(SmartGangster, smartGangsterAddr);

  const currentBlock = await web3.eth.getBlockNumber();
  const bonusEndBlock = await smartGangsterContract.methods.bonusEndBlock().call();
  const isPoolRunning = currentBlock <= bonusEndBlock;

  if (!isPoolRunning) return new BigNumber(0);

  const blockRewards = new BigNumber(await smartGangsterContract.methods.rewardPerBlock().call());
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
  const earnedAssetPrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(earnedAssetPrice).dividedBy(decimals);
  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, oracle, oracleId, tokenAddr) => {
  const tokenPrice = await getPrice(oracle, oracleId);
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getDrugsApys;
