const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID } = require('../../../../constants');

const MasterChef = require('../../../abis/HecoPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/mdexBscLpPools.json');
const singles = require('../../../data/mdexBscSinglePools.json');
const getBlockNumber = require('../../../utils/getBlockNumber');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const ORACLE = 'tokens';
const ORACLE_ID = 'bscMDX';
const DECIMALS = '1e18';

const getMdexBscLpApys = async () => {
  let apys = {};
  const mdxPool = '0xc48FE252Aa631017dF253578B1405ea399728A50';
  const allPools = [...pools, ...singles];

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(mdxPool, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (mdxPool, pool) => {
  let getTotalStaked;
  if (!pool.lp0) {
    getTotalStaked = getTotalStakedInUsd(mdxPool, pool.address, pool.oracle ?? 'tokens', pool.oracleId, pool.decimals ?? '1e18');
  } else {
    getTotalStaked = getTotalLpStakedInUsd(mdxPool, pool, pool.chainId);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(mdxPool, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (mdxPool, pool) => {
  const masterChefContract = new web3.eth.Contract(MasterChef, mdxPool);

  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const blockRewards = new BigNumber(await masterChefContract.methods.reward(blockNum).call());

  let { allocPoint } = await masterChefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterChefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const mdxPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });
  const yearlyRewardsInUsd = yearlyRewards.times(mdxPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getMdexBscLpApys;
