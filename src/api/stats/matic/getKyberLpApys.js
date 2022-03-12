const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/matic/ElysianFields.json');
const DMMPool = require('../../../abis/matic/DMMPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/kyberLpPools.json');
const { BASE_HPY, POLYGON_CHAIN_ID } = require('../../../constants');
const { getVariableTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
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
}

const getAprs = async () => {
  const farmAprs = [];
  const tradingAprs = [];

  const tokenPrice = await fetchPrice({ oracle: oracle, id: oracleId });
  const { blockRewards, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, tradingFees } = await getPoolsData();
  const secondsPerBlock = await getBlockTime(137);

  const pairAddresses = pools.map(pool => pool.lp0.address.concat('_', pool.lp1.address));
  const fetchedTradingAprs = await getVariableTradingFeeApr(kyberClient, pairAddresses, tradingFees);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint);

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    farmAprs.push(apr);
  }

  return { farmAprs, tradingAprs, tradingFees };
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const blockRewards = new BigNumber(await masterchefContract.methods.rwdPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoints().call());
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));

  const balanceCalls = [];
  const allocPointsCalls = [];
  const tradingFeeCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(DMMPool, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    allocPointsCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
    tradingFeeCalls.push({
      tradingFee: tokenContract.methods.getTradeInfo(),
    });
  });

  const res = await multicall.all([balanceCalls, allocPointsCalls, tradingFeeCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => new BigNumber(v.allocPoint['1']));
  const tradingFees = res[2].map(v => new BigNumber(v.tradingFee['4']).dividedBy(DECIMALS));

  return { balances, allocPoints, tradingFees };
};

const getApyBreakdown = async (farmAprs, tradingAprs, tradingFees) => {
  let apys = {};
  let apyBreakdowns = {};
  const shareAfterBeefyPerformanceFee = 0.955;
  const beefyPerformanceFee = 0.045;

  pools.forEach((pool, i) => {
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
}

module.exports = getKyberLpApys;
