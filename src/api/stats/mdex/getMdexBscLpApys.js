const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../utils/web3');
const { BSC_CHAIN_ID } = require('../../../../constants');

const MasterChef = require('../../../abis/HecoPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/mdexBscLpPools.json');
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

  const allPools = pools.slice();
  allPools.push({
    name: 'mdex-bnb',
    poolId: 0,
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    oracle: 'tokens',
    oracleId: 'WBNB',
    decimals: '1e18',
  });
  allPools.push({
    name: 'mdex-busd',
    poolId: 1,
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    oracle: 'tokens',
    oracleId: 'BUSD',
    decimals: '1e18',
  });


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
    getTotalStaked = getTotalStakedInUsd(mdxPool, pool.address, pool.oracle, pool.oracleId, pool.decimals);
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
