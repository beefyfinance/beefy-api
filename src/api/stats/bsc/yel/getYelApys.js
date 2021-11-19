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
const { MultiCall } = require('eth-multicall');
const { bscWeb3: web3, multicallAddress } = require('../../../../utils/web3');

const abi = require('../../../../abis/MasterYel.json');
const ERC20 = require('../../../../abis/ERC20.json');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const fetchPrice = require('../../../../utils/fetchPrice');
const getBlockNumber = require('../../../../utils/getBlockNumber');
import { getFarmWithTradingFeesApy } from '../../../../utils/getFarmWithTradingFeesApy';
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { compound } = require('../../../../utils/compound');

const performanceFee = 0.045;

const getMasterChefApys = async masterchefParams => {
  let apys = {};
  let apyBreakdowns = {};

  masterchefParams.pools = [
    ...(masterchefParams.pools ?? []),
    ...(masterchefParams.singlePools ?? []),
  ];

  const tradingAprs = await getTradingAprs(masterchefParams);
  const farmApys = await getFarmApys(masterchefParams);

  masterchefParams.pools.forEach((pool, i, params) => {
    const hpy = pool.hpy ?? BASE_HPY;
    const perfFee = pool.perfFee ?? performanceFee;
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
  const { rewardsPerSecond, totalAllocPoint } = await getMasterChefData(params);
  const { balances, allocPoints } = await getPoolsData(params);

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
  const masterchefContract = new web3.eth.Contract(abi, params.masterchef);

  const rewardsPerSecond = new BigNumber(await masterchefContract.methods.yelPerSecond().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardsPerSecond, totalAllocPoint };
};

const getPoolsData = async params => {
  const masterchefContract = new web3.eth.Contract(abi, params.masterchef);
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const poolInfoCalls = [];
  params.pools.forEach(pool => {
    poolInfoCalls.push({
      poolInfo: masterchefContract.methods.poolInfo(pool.poolId),
    });
  });

  const res = await multicall.all([poolInfoCalls]);

  const balances = res[0].map(v => new BigNumber(v.poolInfo['1']));
  const allocPoints = res[0].map(v => v.poolInfo['4']);
  return { balances, allocPoints };
};
