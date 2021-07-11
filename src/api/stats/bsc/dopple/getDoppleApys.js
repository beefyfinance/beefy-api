const axios = require('axios');
const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

import getApyBreakdown from '../../common/getApyBreakdown';

const fetchPrice = require('../../../../utils/fetchPrice');
const {
  getTotalLpStakedInUsd,
  getTotalStakedInUsd,
} = require('../../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const MasterChef = require('../../../../abis/DoppleMasterChef.json');
const lpPools = require('../../../../data/doppleLpPools.json');
const pools = require('../../../../data/dopplePools.json');
const tradingFees = 0.00045;

const getDoppleApys = async () => {
  const baseApys = await getBaseApys();
  const farmApys = [];

  let promises = [];
  const masterchef = '0xDa0a175960007b0919DBF11a38e6EC52896bddbE';
  [...lpPools, ...pools].forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);
  for (const item of values) {
    farmApys.push(item);
  }

  const poolsMap = [...lpPools, ...pools].map(p => ({
    name: p.name,
    address: p.address ?? p.swap,
  }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApy = async (masterchef, pool) => {
  let getTotalStaked;
  if (pool.token) {
    getTotalStaked = getTotalStakedInUsd(masterchef, pool.token, pool.oracle, pool.oracleId);
  } else {
    getTotalStaked = getTotalLpStakedInUsd(masterchef, pool);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStaked,
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  // console.log(pool.name, simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const getBaseApys = async () => {
  let apys = {};
  try {
    const response = await axios.get('https://dopple-api.kowito.com/');
    const pools = response.data.pool;
    Object.keys(pools).forEach(pool => {
      const apy = new BigNumber((pools[pool].apy ?? 0) / 100);
      apys = { ...apys, ...{ [pool.toLowerCase()]: apy } };
    });
  } catch (err) {
    console.error(err);
  }
  return apys;
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.dopplePerBlock().call());

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

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'DOP' });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getDoppleApys;
