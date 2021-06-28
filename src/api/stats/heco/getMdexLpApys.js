const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');

const HecoPool = require('../../../abis/HecoPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/heco/mdexLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY, HECO_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { mdexHecoClient } = require('../../../apollo/client');
const getBlockNumber = require('../../../utils/getBlockNumber');

const hecoPool = '0xFB03e11D93632D97a8981158A632Dd5986F5E909';

const liquidityProviderFee = 0.0014;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getMdexLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = {}; //await getTradingFeeApr(mdexHecoClient, pairAddresses, liquidityProviderFee);

  const allPools = [...pools];

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(hecoPool, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    const simpleApr = item.simpleApr;
    const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
    const tradingApr = tradingAprs[item.address.toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(simpleApr, tradingApr, BASE_HPY, 1, 0.955);
    const legacyApyValue = { [item.name]: totalApy };
    // Add token to APYs object
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [item.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: liquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };
    // Add token to APYs object
    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getPoolApy = async (hecoPool, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(hecoPool, pool),
    getTotalLpStakedInUsd(hecoPool, pool, pool.chainId),
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
};

const getYearlyRewardsInUsd = async (hecoPool, pool) => {
  const hecoPoolContract = new web3.eth.Contract(HecoPool, hecoPool);

  const blockNum = await getBlockNumber(HECO_CHAIN_ID);
  const blockRewards = new BigNumber(await hecoPoolContract.methods.reward(blockNum).call());

  let { allocPoint } = await hecoPoolContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await hecoPoolContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const mdxPrice = await fetchPrice({ oracle: 'tokens', id: 'MDX' });
  const yearlyRewardsInUsd = yearlyRewards.times(mdxPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getMdexLpApys;
