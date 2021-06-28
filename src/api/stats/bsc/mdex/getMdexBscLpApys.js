const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID } = require('../../../../constants');

const MasterChef = require('../../../../abis/HecoPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/mdexBscLpPools.json');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../../utils/getFarmWithTradingFeesApy');
const { mdexBscClient } = require('../../../../apollo/client');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const ORACLE = 'tokens';
const ORACLE_ID = 'bscMDX';
const DECIMALS = '1e18';

const liquidityProviderFee = 0.002;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getMdexBscLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const mdxPool = '0xc48FE252Aa631017dF253578B1405ea399728A50';
  const allPools = [...pools];

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = {}; //await getTradingFeeApr(mdexBscClient, pairAddresses, liquidityProviderFee);

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(mdxPool, pool)));
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

const getPoolApy = async (mdxPool, pool) => {
  let getTotalStaked;
  if (!pool.lp0) {
    getTotalStaked = getTotalStakedInUsd(
      mdxPool,
      pool.address,
      pool.oracle ?? 'tokens',
      pool.oracleId,
      pool.decimals ?? '1e18'
    );
  } else {
    getTotalStaked = getTotalStakedInUsd(mdxPool, pool.address, 'lps', pool.name);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(mdxPool, pool),
    getTotalStaked,
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
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
