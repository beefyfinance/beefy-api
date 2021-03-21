const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/degens/BlizzardMasterChef.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const getBlizzardApy = async () => {
  const masterChef = '0x2078F4A75c92A6918D13e3e2F14183443ebf55D3';
  const blzd = '0x57067A6BD75c0E95a6A5f158455926e43E79BeB0';
  const oracle = 'pancake';
  const oracleId = 'BLZD';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterChef, oracle, oracleId),
    getTotalStakedInUsd(masterChef, blzd, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.94);

  return { 'blizzard-blzd': apy };
};

const getYearlyRewardsInUsd = async (masterChefAddr, oracle, oracleId) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const masterChefContract = new web3.eth.Contract(MasterChef, masterChefAddr);

  const multiplier = new BigNumber(
    await masterChefContract.methods.getMultiplier(fromBlock, toBlock).call()
  );
  const blockRewards = new BigNumber(await masterChefContract.methods.blzdPerBlock().call());

  let { allocPoint } = await masterChefContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterChefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const blzdPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(blzdPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBlizzardApy;
