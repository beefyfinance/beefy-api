const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const IBakeryMaster = require('../../../abis/IBakeryMaster.json');
const { getPrice } = require('../../../utils/getPrice');

const web3 = new Web3(process.env.BSC_RPC);

const getYearlyRewardsInUsd = async (bakeryMaster, asset) => {
  const currentBlock = await web3.eth.getBlockNumber();
  const bakeryMasterContract = new web3.eth.Contract(IBakeryMaster, bakeryMaster);

  const blockRewards = new BigNumber(
    await bakeryMasterContract.methods.getTotalRewardInfo(currentBlock, currentBlock + 1).call()
  );

  const totalAllocPoint = new BigNumber(
    await bakeryMasterContract.methods.totalAllocPoint().call()
  );

  let { allocPoint } = await bakeryMasterContract.methods.poolInfoMap(asset).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = allocPoint.times(blockRewards).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bakePrice = await getPrice('pancake', 'BAKE');
  const yearlyRewardsInUsd = yearlyRewards.times(bakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getYearlyRewardsInUsd;
