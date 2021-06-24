const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const MasterChef = require('../../../abis/OliveMasterChef.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/avax/oliveLpPools.json');
const { compound } = require('../../../utils/compound');
const {
  getTotalStakedInUsd,
  getTotalLpStakedInUsd,
} = require('../../../utils/getTotalStakedInUsd');
const { AVAX_CHAIN_ID, BASE_HPY } = require('../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { oliveClient } = require('../../../apollo/client');

const masterchef = '0x5A9710f3f23053573301C2aB5024D0a43A461E80';
const oracleId = 'OLIVE';
const oracle = 'tokens';
const DECIMALS = '1e18';

const liquidityProviderFee = 0.0017;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getOliveLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(oliveClient, pairAddresses, liquidityProviderFee);

  const allPools = [...pools];

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
  let getTotalStaked;
  if (pool.poolId === 0) {
    getTotalStaked = getTotalStakedInUsd(
      masterchef,
      pool.address,
      pool.oracle,
      pool.oracleId,
      '1e18',
      chainId
    );
  } else {
    getTotalStaked = getTotalLpStakedInUsd(masterchef, pool, AVAX_CHAIN_ID);
  }
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStaked,
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(AVAX_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
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
