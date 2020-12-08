const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const SmartGangster = require('../../../abis/SmartGangster.json');
const ERC20 = require('../../../abis/ERC20.json');
const getBaseDrugsApy = require('./getBaseDrugsApy');
const { getPrice } = require('../../../utils/getPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const pools = require('../../../data/drugsPools.json');
const { compound } = require('../../../utils/compound');

const web3 = new Web3(process.env.BSC_RPC);

const getDrugsApys = async () => {
  const apys = {};
  const hoes = '0xfE60B258204398F008581775F08D2b43fb7b422b';

  const baseDrugsApy = await getBaseDrugsApy();

  for (const pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(
      pool.smartGangster,
      pool.oracle,
      pool.oracleId,
      pool.decimals
    );

    const totalStakedInUsd = await getTotalStakedInUsd(
      pool.smartGangster,
      hoes,
      pool.oracle,
      pool.oracleId
    );

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).plus(baseDrugsApy);
    apys[pool.name] = compound(simpleApy, process.env.BASE_HPY, 1, 0.94);
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

getDrugsApys();

module.exports = getDrugsApys;
