const BigNumber = require('bignumber.js');
const { BASE_HPY, BSC_CHAIN_ID } = require('../../../../constants');
import { fetchPrice } from '../../../../utils/fetchPrice';
const getBlockNumber = require('../../../../utils/getBlockNumber');
import ERC20Abi from '../../../../abis/ERC20Abi';
import MasterChef from '../../../../abis/MasterChef';
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
    const performanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterPerfFee = 1 - performanceFee;

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
        beefyPerformanceFee: performanceFee,
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
  const [{ multiplier, blockRewards, totalAllocPoint }, { balances, allocPoints }] =
    await Promise.all([getMasterChefData(params), getPoolsData(params)]);

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards
      .times(multiplier)
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint);

    const secondsPerBlock = params.secondsPerBlock ?? 3;
    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(params.decimals);

    if (params.log) {
      console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
    }

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }

  return apys;
};

const getMasterChefData = async params => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, BSC_CHAIN_ID);
  let multiplier = new BigNumber(1);
  if (params.hasMultiplier) {
    const blockNum = await getBlockNumber(BSC_CHAIN_ID);
    multiplier = new BigNumber(
      (await masterchefContract.read.getMultiplier([blockNum - 1, blockNum])).toString()
    );
  }
  const [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read[params.tokenPerBlock]().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { multiplier, blockRewards, totalAllocPoint };
};

const getPoolsData = async params => {
  const abi = params.masterchefAbi ?? chefAbi(params.tokenPerBlock);
  const masterchefContract = fetchContract(params.masterchef, abi, BSC_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  params.pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, BSC_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([pool.strat ?? params.masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(allocPointCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => v['1'].toString());
  return { balances, allocPoints };
};

const chefAbi = tokenPerBlock => {
  const cakeAbi = [
    ...MasterChef,
    {
      inputs: [],
      name: tokenPerBlock,
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  return cakeAbi;
};

module.exports = getMasterChefApys;
