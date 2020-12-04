const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const IBakeryMaster = require('../../../abis/IBakeryMaster.json');
const { getPrice } = require('../../../utils/getPrice');
const getTotalStakedInUsd = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');

const web3 = new Web3(process.env.BSC_RPC);

const getBakePoolApy = async () => {
  const bakeryMaster = '0x20eC291bB8459b6145317E7126532CE7EcE5056f';
  const bake = '0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5';
  const oracle = 'pancake';
  const oracleId = 'BAKE';

  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bakeryMaster, bake, oracle, oracleId),
    getTotalStakedInUsd(bakeryMaster, bake, oracle, oracleId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BAKE_HPY, 1, 0.94);

  return { 'bakery-bake': apy };
};

const getYearlyRewardsInUsd = async (bakeryMaster, bake, oracle, oracleId) => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const bakeryMasterContract = new web3.eth.Contract(IBakeryMaster, bakeryMaster);

  const blockRewards = new BigNumber(
    await bakeryMasterContract.methods.getTotalRewardInfo(fromBlock, toBlock).call()
  );

  const totalAllocPoint = new BigNumber(
    await bakeryMasterContract.methods.totalAllocPoint().call()
  );

  let { allocPoint } = await bakeryMasterContract.methods.poolInfoMap(bake).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bakePrice = await getPrice(oracle, oracleId);
  const yearlyRewardsInUsd = yearlyRewards.times(bakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getBakePoolApy;
