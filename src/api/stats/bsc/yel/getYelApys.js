const pools = require('../../../../data/degens/yelLpPools.json');
const { apeClient } = require('../../../../apollo/client');

const getYelApys = () =>
  getMasterChefApys({
    masterchef: '0x954b15065e4FA1243Cd45a020766511b68Ea9b6E',
    hasMultiplier: true,
    pools: pools,
    singlePools: [
      {
        name: 'yel-yel',
        poolId: 0,
        address: '0xD3b71117E6C1558c1553305b44988cd944e97300',
        oracle: 'tokens',
        oracleId: 'YEL',
        decimals: '1e18',
      },
    ],
    oracleId: 'YEL',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: 0.0015,
    // log: true,
  });

module.exports = getYelApys;

const BigNumber = require('bignumber.js');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const fetchPrice = require('../../../../utils/fetchPrice');
import MasterYel from '../../../../abis/MasterYel';
import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../../vaults/getVaultFees';
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { compound } = require('../../../../utils/compound');

const getMasterChefApys = async masterchefParams => {
  let apys = {};
  let apyBreakdowns = {};

  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingAprs(masterchefParams),
    getFarmApys(masterchefParams),
  ]);

  masterchefParams.pools.forEach((pool, i, params) => {
    const hpy = pool.hpy ?? BASE_HPY;
    const perfFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterPerfFee = 1 - perfFee;

    const simpleApr = farmApys[i];
    const vaultApr = simpleApr.times(shareAfterPerfFee);
    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const vaultApy = compound(simpleApr, hpy, 1, shareAfterPerfFee);
    const totalApy = getFarmWithTradingFeesApy(simpleApr, tradingApr, hpy, 1, shareAfterPerfFee);

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: totalApy };
    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: hpy,
        beefyPerformanceFee: perfFee,
        vaultApy: vaultApy,
        lpFee: params.liquidityProviderFee,
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

const getTradingAprs = async params => {
  let tradingAprs = [];
  const client = params.tradingFeeInfoClient;
  const fee = params.liquidityProviderFee;
  if (client && fee) {
    const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
    const getAprs = getTradingFeeApr;
    tradingAprs = await getAprs(client, pairAddresses, fee);
  }
  return tradingAprs;
};

const getFarmApys = async params => {
  const apys = [];

  const tokenPrice = await fetchPrice({ oracle: params.oracle, id: params.oracleId });
  const [{ rewardsPerSecond, totalAllocPoint }, { balances, allocPoints }] = await Promise.all([
    getMasterChefData(params),
    getPoolsData(params),
  ]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolSecondsRewards = rewardsPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);

    const secondsPerYear = 31536000;
    const yearlyRewards = poolSecondsRewards.times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    if (params.log) {
      console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }

  return apys;
};

const getMasterChefData = async params => {
  const masterchefContract = fetchContract(params.masterchef, MasterYel, BSC_CHAIN_ID);
  const [rewardsPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.yelPerSecond().then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);
  return { rewardsPerSecond, totalAllocPoint };
};

const getPoolsData = async params => {
  const masterchefContract = fetchContract(params.masterchef, MasterYel, BSC_CHAIN_ID);
  const poolInfoCalls = params.pools.map(pool => masterchefContract.read.poolInfo([pool.poolId]));

  const res = await Promise.all(poolInfoCalls);

  const balances = res.map(v => new BigNumber(v[1].toString()));
  const allocPoints = res.map(v => new BigNumber(v[4].toString()));
  return { balances, allocPoints };
};
