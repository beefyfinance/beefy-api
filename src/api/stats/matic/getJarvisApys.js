const BigNumber = require('bignumber.js');

const pools = require('../../../data/matic/jarvisPools.json');
import { fetchPrice } from '../../../utils/fetchPrice';
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const getBlockTime = require('../../../utils/getBlockTime');
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import ElysianFields from '../../../abis/matic/ElysianFields';
import { fetchContract } from '../../rpc/client';
import { POLYGON_CHAIN_ID } from '../../../constants';

const DECIMALS = '1e18';
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/polygon';
const tradingFee = 0.0004;

const getJarvisApys = async () => {
  let promises = [];
  const filteredPools = pools.filter(p => p.name != 'jarvis-2eure'); // temp fix while trading APY is broken
  const baseApys = await getCurveBaseApys(filteredPools, baseApyUrl);
  pools.forEach(pool => promises.push(getPoolApy(pool)));
  const farmAprs = await Promise.all(promises);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name, beefyFee: p.beefyFee }));

  return getApyBreakdown(poolsMap, baseApys, farmAprs, tradingFee);
};

const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool.masterchef, pool.poolId, pool.rewardOracle, pool.rewardToken),
    getTotalLpStakedInUsd(pool.masterchef, pool, pool.chainId),
  ]);

  //console.log(pool.name, yearlyRewardsInUsd.dividedBy(totalStakedInUsd).valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async (masterchef, poolId, oracle, oracleId) => {
  const masterchefContract = fetchContract(masterchef, ElysianFields, POLYGON_CHAIN_ID);

  const [allocPoint, blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read.poolInfo([poolId]).then(v => new BigNumber(v[1].toString())),
    masterchefContract.read.rwdPerBlock().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoints().then(v => new BigNumber(v.toString())),
  ]);

  const secondsPerYear = 31536000;
  const secondsPerBlock = await getBlockTime(137);
  const yearlyRewards = blockRewards
    .times(secondsPerYear)
    .dividedBy(secondsPerBlock)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = { getJarvisApys };
