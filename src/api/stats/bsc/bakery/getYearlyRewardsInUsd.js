const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const IBakeryMaster = require('../../../../abis/IBakeryMaster.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { BSC_CHAIN_ID } = require('../../../../constants');

const getYearlyRewardsInUsd = async (bakeryMaster, asset) => {
  const currentBlock = await getBlockNumber(BSC_CHAIN_ID);
  const bakeryMasterContract = new web3.eth.Contract(IBakeryMaster, bakeryMaster);

  let [blockRewards, totalAllocPoint] = await Promise.all([
    bakeryMasterContract.methods.getTotalRewardInfo(currentBlock, currentBlock + 1).call(),
    bakeryMasterContract.methods.totalAllocPoint().call(),
  ]);

  blockRewards = new BigNumber(blockRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  let { allocPoint } = await bakeryMasterContract.methods.poolInfoMap(asset).call();
  allocPoint = new BigNumber(allocPoint);

  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const bakePrice = await fetchPrice({ oracle: 'tokens', id: 'BAKE' });
  const yearlyRewardsInUsd = yearlyRewards.times(bakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getYearlyRewardsInUsd;
