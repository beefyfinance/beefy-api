const BigNumber = require('bignumber.js');

import { fetchPrice } from '../../../utils/fetchPrice';
const pools = require('../../../data/matic/kyberLpPools.json');
const { BASE_HPY, POLYGON_CHAIN_ID } = require('../../../constants');
const { getVariableTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import DMMPool from '../../../abis/matic/DMMPool';
import ElysianFields from '../../../abis/matic/ElysianFields';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { kyberClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
const getBlockTime = require('../../../utils/getBlockTime');

const masterchef = '0xFAA0f413E67A56cbbE181024279bA5504Ce487EF';
const oracleId = 'AUR';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getKyberLpApys = async () => {
  const { farmAprs, tradingAprs, tradingFees } = await getAprs();

  return await getApyBreakdown(farmAprs, tradingAprs, tradingFees);
};

const getAprs = async () => {
  const farmAprs = [];
  const tradingAprs = [];

  const tokenPrice = await fetchPrice({ oracle: oracle, id: oracleId });

  const [
    { blockRewards, totalAllocPoint },
    { balances, allocPoints, tradingFees },
    secondsPerBlock,
  ] = await Promise.all([getMasterChefData(), getPoolsData(), getBlockTime(137)]);

  //Commenting out since it isn't used
  // const pairAddresses = pools.map(pool => pool.lp0.address.concat('_', pool.lp1.address));
  // const fetchedTradingAprs = await getVariableTradingFeeApr(kyberClient, pairAddresses, tradingFees)

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards.times(allocPoints[i]).dividedBy(totalAllocPoint);

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    farmAprs.push(apr);
  }

  return { farmAprs, tradingAprs, tradingFees };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, ElysianFields, POLYGON_CHAIN_ID);
  const [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read.rwdPerBlock().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoints().then(v => new BigNumber(v.toString())),
  ]);
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async () => {
  const masterchefContract = fetchContract(masterchef, ElysianFields, POLYGON_CHAIN_ID);

  const balanceCalls = [];
  const allocPointsCalls = [];
  const tradingFeeCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, DMMPool, POLYGON_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    allocPointsCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    tradingFeeCalls.push(tokenContract.read.getTradeInfo());
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointsCalls),
    Promise.all(tradingFeeCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['1'].toString()));
  const tradingFees = res[2].map(v => new BigNumber(v['4'].toString()).dividedBy(DECIMALS));

  return { balances, allocPoints, tradingFees };
};

const getApyBreakdown = async (farmAprs, tradingAprs, tradingFees) => {
  let apys = {};
  let apyBreakdowns = {};

  pools.forEach((pool, i) => {
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

    const vaultApr = farmAprs[i].times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(farmAprs[i], BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr =
      tradingAprs[pool.lp0.address.concat('_', pool.lp1.address).toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      farmAprs[i],
      tradingApr,
      BASE_HPY,
      1,
      shareAfterBeefyPerformanceFee
    );

    const legacyApyValue = { [pool.name]: totalApy };
    apys = { ...apys, ...legacyApyValue };

    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: tradingFees[i].toNumber(),
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };

    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  });

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = getKyberLpApys;
