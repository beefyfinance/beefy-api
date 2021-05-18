const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/degens/BlizzardYetiMaster.json');
const BlizzardStratAbi = require('../../../../abis/StrategyChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const masterChef = '0x367CdDA266ADa588d380C7B970244434e4Dde790';
const masterChefContract = new web3.eth.Contract(MasterChef, masterChef);
const oracle = 'tokens';
const oracleId = 'xBLZD';
const DECIMALS = '1e18';

const getBlizzardApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);

  return { 'blizzard-xblzd': apy };
};

const getYearlyRewardsInUsd = async () => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);

  const multiplier = new BigNumber(
    await masterChefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterChefContract.methods.xBLZDPerBlock().call());

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

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  let { strat } = await masterChefContract.methods.poolInfo(0).call();

  const strategyContract = new web3.eth.Contract(BlizzardStratAbi, strat);
  const totalStaked = new BigNumber(await strategyContract.methods.wantLockedTotal().call());
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy(DECIMALS);
  return totalStakedInUsd;
};

module.exports = getBlizzardApy;
