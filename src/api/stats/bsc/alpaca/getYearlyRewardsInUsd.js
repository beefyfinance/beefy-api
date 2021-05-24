const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const FairLaunch = require('../../../../abis/FairLaunch.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { BSC_CHAIN_ID } = require('../../../../constants');

const getYearlyRewardsInUsd = async (fairLaunch, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const fairLaunchContract = new web3.eth.Contract(FairLaunch, fairLaunch);

  const multiplier = new BigNumber(
    await fairLaunchContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await fairLaunchContract.methods.alpacaPerBlock().call());

  let { allocPoint } = await fairLaunchContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await fairLaunchContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'ALPACA' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getYearlyRewardsInUsd;
