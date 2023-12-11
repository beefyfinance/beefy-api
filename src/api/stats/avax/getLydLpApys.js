const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/avax/lydLpPools.json');
const { compound } = require('../../../utils/compound');
const { AVAX_CHAIN_ID, BASE_HPY } = require('../../../constants');
const getBlockNumber = require('../../../utils/getBlockNumber');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import ERC20Abi from '../../../abis/ERC20Abi';
import LydChef from '../../../abis/avax/LydChef';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { lydiaClient } = require('../../../apollo/client');

const { lpTokenPrice } = require('../../../utils/lpTokens');

const masterchef = '0xFb26525B14048B7BB1F3794F6129176195Db7766';
const oracleId = 'LYD';
const oracle = 'tokens';
const DECIMALS = '1e18';

const liquidityProviderFee = 0.0017;

const getLydLpApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const pairAddresses = pools.map(pool => pool.address);

  const allPools = [...pools];

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));

  const [tradingAprs, values] = await Promise.all([
    getTradingFeeApr(lydiaClient, pairAddresses, liquidityProviderFee),
    Promise.all(promises),
  ]);

  for (let item of values) {
    const simpleApr = item.simpleApr;
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(item.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
    const tradingApr = tradingAprs[item.address.toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApr,
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );
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
    getTotalLpStakedInUsd(masterchef, pool, pool.chainId),
  ]);
  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const address = pool.address;
  const name = pool.name;
  return { name, address, simpleApr };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await getBlockNumber(AVAX_CHAIN_ID);
  const masterchefContract = fetchContract(masterchef, LydChef, AVAX_CHAIN_ID);

  const [multiplier, rewards, allocPoint, totalAllocPoint] = await Promise.all([
    masterchefContract.read
      .getMultiplier([blockNum - 1, blockNum])
      .then(v => new BigNumber(v.toString())),
    masterchefContract.read.lydPerSec().then(v => new BigNumber(v.toString())),
    masterchefContract.read.poolInfo([pool.poolId]).then(v => new BigNumber(v[1].toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);

  const poolBlockRewards = rewards.times(multiplier).times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 1;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalLpStakedInUsd = async (targetAddr, pool) => {
  const tokenPairContract = fetchContract(pool.address, ERC20Abi, AVAX_CHAIN_ID);
  const [totalStaked, tokenPrice] = await Promise.all([
    tokenPairContract.read.balanceOf([targetAddr]).then(v => new BigNumber(v.toString())),
    lpTokenPrice(pool),
  ]);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getLydLpApys;
