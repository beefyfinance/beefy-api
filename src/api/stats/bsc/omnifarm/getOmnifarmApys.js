const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const StakingPoolABI = require('../../../../abis/IOmnifarmFarm.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID, BASE_HPY } = require('../../../../constants');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../../utils/getFarmWithTradingFeesApy');
const { cakeClient } = require('../../../../apollo/client');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const pools = require('../../../../data/degens/omnifarmLpPools.json');
const { ERC20_ABI } = require('../../../../abis/common/ERC20');

const oracle = 'tokens';

const liquidityProviderFee = 0.0017;
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getOmnifarmApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const allPools = [...pools];

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, liquidityProviderFee);

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(pool)));
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
const getPoolApy = async pool => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(pool.strat),
    getTotalLpStakedInUsd(pool.strat, pool, pool.chainId),
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
};

const getYearlyRewardsInUsd = async stakingPoolAddress => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = new web3.eth.Contract(StakingPoolABI, stakingPoolAddress);

  const farmInfo = await masterchefContract.methods.farmInfo().call();
  if (farmInfo.endBlock < blockNum) return new BigNumber(0);

  const poolBlockRewards = new BigNumber(farmInfo.blockReward);

  const tokenContract = new web3.eth.Contract(ERC20_ABI, farmInfo.rewardToken);
  const tokenSymbol = await tokenContract.methods.symbol().call();
  const tokenDecimals = await tokenContract.methods.decimals().call();

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: tokenSymbol });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(`1e${tokenDecimals}`);

  return yearlyRewardsInUsd;
};

module.exports = getOmnifarmApys;
