const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/TenfiMasterChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/tenfiLpPools.json');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const {
  getTotalLpStakedInUsd,
  getTotalStakedInUsd,
} = require('../../../../utils/getTotalStakedInUsd');

const masterchef = '0x264A1b3F6db28De4D3dD4eD23Ab31A468B0C1A96';
const oracleId = 'TENFI';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getTenfiApys = async () => {
  let apys = {};

  let promises = [];
  const allPools = [...pools];
  allPools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  let getTotalStaked;
  if (pool.token) {
    getTotalStaked = getTotalStakedInUsd(
      pool.strat,
      pool.token,
      pool.oracle,
      pool.oracleId,
      pool.decimals,
      BSC_CHAIN_ID
    );
  } else {
    getTotalStaked = getTotalLpStakedInUsd(pool.strat, pool);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.TENFIPerBlock().call());

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

module.exports = getTenfiApys;
