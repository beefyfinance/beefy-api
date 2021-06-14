const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/degens/BlizzardYetiMaster.json');
const BlizzardStratAbi = require('../../../../abis/StrategyChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/blizzardLpPools.json');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { lpTokenPrice } = require('../../../../utils/lpTokens');

const masterchef = '0x367CdDA266ADa588d380C7B970244434e4Dde790';
const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
const oracle = 'tokens';
const oracleId = 'xBLZD';
const DECIMALS = '1e18';

const getBlizzardLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool),
    getTotalLpStakedInUsd(pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pool => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.xBLZDPerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
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

const getTotalLpStakedInUsd = async pool => {
  let { strat } = await masterchefContract.methods.poolInfo(pool.poolId).call();

  const strategyContract = new web3.eth.Contract(BlizzardStratAbi, strat);
  const totalStaked = new BigNumber(await strategyContract.methods.wantLockedTotal().call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy(DECIMALS);
  return totalStakedInUsd;
};

module.exports = getBlizzardLpApys;
