const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/OliveMasterChef.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/oliveLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalStakedInUsd, getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { AVAX_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');

const masterchef = '0x5A9710f3f23053573301C2aB5024D0a43A461E80';
const oracleId = 'OLIVE';
const oracle = 'tokens';
const DECIMALS = '1e18';
const chainId = 43114;

const getOliveLpApys = async () => {
  let apys = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  let getTotalStaked;
  if (pool.poolId === 0) {
    getTotalStaked = getTotalStakedInUsd(masterchef, pool.address, pool.oracle, pool.oracleId, '1e18', chainId);
  } else {
    getTotalStaked = getTotalLpStakedInUsd(masterchef, pool, chainId);
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
  const blockNum = await getBlockNumber(AVAX_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call(),
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.olivePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 5;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getOliveLpApys;
