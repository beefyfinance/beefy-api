const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const MasterChef = require('../../../../abis/degens/SwampChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/degens/swampyLpPools.json');
const { compound } = require('../../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { BSC_CHAIN_ID, BASE_HPY } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../../utils/getFarmWithTradingFeesApy');
const { cakeClient } = require('../../../../apollo/client');

const masterchef = '0x33AdBf5f1ec364a4ea3a5CA8f310B597B8aFDee3';
const oracleId = 'SWAMP';
const oracle = 'tokens';
const DECIMALS = '1e18';

const liquidityProviderFee = 0.0017;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getSwampyLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const allPools = [...pools];

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, liquidityProviderFee);

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
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

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(pool.strategy, pool),
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.NATIVEPerBlock().call());

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

module.exports = getSwampyLpApys;
