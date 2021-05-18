const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const SwampChef = require('../../../../abis/degens/SwampChef.json');
const SwampStrat = require('../../../../abis/StrategyCakeSwamp.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const swampchef = '0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3';
const swampStrat = '0xc65D6E612C27b7C9B00dE40715015EEa81368252';
const oracleId = 'SWAMP';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getSwampySwampApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  //console.log('swamp-swamp', simpleApy.valueOf(), simpleApy, apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { 'swamp-swamp': apy };
};

const getYearlyRewardsInUsd = async () => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const swampchefContract = new web3.eth.Contract(SwampChef, swampchef);

  const multiplier = new BigNumber(
    await swampchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await swampchefContract.methods.NATIVEPerBlock().call());

  let { allocPoint } = await swampchefContract.methods.poolInfo(2).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await swampchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const strategyContract = new web3.eth.Contract(SwampStrat, swampStrat);
  const totalStaked = new BigNumber(await strategyContract.methods.wantLockedTotal().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getSwampySwampApy;
