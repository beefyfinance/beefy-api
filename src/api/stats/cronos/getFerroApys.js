const { CRONOS_CHAIN_ID: chainId, CRONOS_CHAIN_ID } = require('../../../constants');
const pools = require('../../../data/cronos/ferroPools.json');
import getBlockTime from '../../../utils/getBlockTime';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import StrategyABI from '../../../abis/StrategyABI';
import FerroFarm from '../../../abis/cronos/FerroFarm';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const lpFee = 0.0004;
const burn = 0.4;

const fer = '0x39bC1e38c842C60775Ce37566D03B41A7A66C782';
const xFer = '0x6b82eAce10F782487B61C616B623A78c965Fdd88';
const xFerBoost = '0xCf3e157E2491F7D739f8923f6CeaA4656E64C92e';
const chef = '0xAB50FB1117778f293cc33aC044b5579fb03029D0';
const factoryUrl = 'https://api.ferroprotocol.com/info/api/getApys';

const getFerroApys = async () => {
  const [tradingApys, farmApys] = await Promise.all([getTradingApys(), getFarmApys()]);

  return getApyBreakdown(pools, tradingApys, farmApys, lpFee);
};

const getTradingApys = async () => {
  let apys = {};
  try {
    const response = await fetch(factoryUrl).then(res => res.json());
    const apyData = response.data;
    pools.forEach(pool => {
      let apy = new BigNumber(getApiData(apyData, pool.key));
      apys = { ...apys, ...{ [pool.address.toLowerCase()]: apy } };
    });
  } catch (err) {
    console.error('Ferro base apy error', err);
  }
  return apys;
};

const getApiData = (apyData, poolKey) => {
  try {
    let pool = apyData[poolKey];
    if (!pool) return 0;
    let apy = pool.baseApr;
    return Number(apy) / 100;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getFarmApys = async () => {
  let apys = [];

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'FER' });

  const [
    { blockRewards, totalAllocPoint, xFerAllocPoint, xFerToFer, xFerBoostTotalSupply },
    { balances, allocPoints, strategyBalances, xFerBoostBalances },
    secondsPerBlock,
  ] = await Promise.all([getMasterChefData(), getPoolsData(), getBlockTime(chainId)]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = 'lps';
    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy('1e18');
    const totalStrategyStakedInUsd = strategyBalances[i].times(stakedPrice).dividedBy('1e18');

    const poolBlockRewards = blockRewards
      .times(allocPoints[i])
      .dividedBy(totalAllocPoint)
      .times(1 - burn);

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

    let apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

    // how many rewards our vesting tokens are generating
    const xPoolBlockRewards = blockRewards
      .times(xFerAllocPoint)
      .dividedBy(totalAllocPoint)
      .times(xFerBoostBalances[i])
      .dividedBy(xFerBoostTotalSupply);

    // how many rewards will be vested over the year
    const vestedRewards = xFerBoostBalances[i]
      .times(12) // strategy only holds upto 30 days of vested rewards
      .times(xFerToFer)
      .dividedBy(100); // 100 xFerBoost to 1 xFer

    const xFerYearlyRewards = xPoolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const xFerYearlyRewardsInUsd = xFerYearlyRewards.times(tokenPrice).dividedBy('1e18');

    const vestedRewardsInUsd = vestedRewards.times(tokenPrice).dividedBy('1e18');
    const extraRewards = xFerYearlyRewardsInUsd.plus(vestedRewardsInUsd);

    const extraApy = extraRewards.dividedBy(totalStrategyStakedInUsd);

    apy = apy.plus(extraApy);
    apys.push(apy);
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(chef, FerroFarm, CRONOS_CHAIN_ID);
  const xFerContract = fetchContract(xFer, ERC20Abi, CRONOS_CHAIN_ID);
  const ferContract = fetchContract(fer, ERC20Abi, CRONOS_CHAIN_ID);
  const xFerBoostContract = fetchContract(xFerBoost, ERC20Abi, CRONOS_CHAIN_ID);

  const [
    blockRewards,
    totalAllocPoint,
    xFerAllocPoint,
    xFerTotalSupply,
    ferBalance,
    xFerBoostTotalSupply,
  ] = await Promise.all([
    masterchefContract.read.ferPerBlock().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
    masterchefContract.read.poolInfo([0]).then(v => new BigNumber(v['1'].toString())),
    xFerContract.read.totalSupply().then(v => new BigNumber(v.toString())),
    ferContract.read.balanceOf([xFer]).then(v => new BigNumber(v.toString())),
    xFerBoostContract.read.totalSupply().then(v => new BigNumber(v.toString())),
  ]);

  const xFerToFer = ferBalance.dividedBy(xFerTotalSupply);

  return { blockRewards, totalAllocPoint, xFerAllocPoint, xFerToFer, xFerBoostTotalSupply };
};

const getPoolsData = async () => {
  const masterchefContract = fetchContract(chef, FerroFarm, CRONOS_CHAIN_ID);
  const xFerBoostContract = fetchContract(xFerBoost, ERC20Abi, CRONOS_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  const strategyCalls = [];
  const xFerBoostCalls = [];

  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, CRONOS_CHAIN_ID);
    const strategyContract = fetchContract(pool.strategy, StrategyABI, CRONOS_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([chef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    strategyCalls.push(strategyContract.read.balanceOfPool());
    xFerBoostCalls.push(xFerBoostContract.read.balanceOf([pool.strategy]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(strategyCalls),
    Promise.all(xFerBoostCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v['1'].toString()));
  const strategyBalances = res[2].map(v => new BigNumber(v.toString()));
  const xFerBoostBalances = res[3].map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, strategyBalances, xFerBoostBalances };
};

module.exports = getFerroApys;
