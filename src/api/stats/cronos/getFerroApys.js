const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const pools = require('../../../data/cronos/ferroPools.json');
import { getContractWithProvider } from '../../../utils/contractHelper';
import { multicallAddress } from '../../../utils/web3';
import { MultiCall } from 'eth-multicall';
import getBlockTime from '../../../utils/getBlockTime';
import fetchPrice from '../../../utils/fetchPrice';
import getApyBreakdown from '../common/getApyBreakdown';
import BigNumber from 'bignumber.js';
import fetch from 'node-fetch';

const chefAbi = require('../../../abis/cronos/FerroFarm.json');
const ERC20 = require('../../../abis/ERC20.json');
const strategyAbi = require('../../../abis/StrategyABI.json');

const lpFee = 0.0004;
const burn = 0.4;

const fer = "0x39bC1e38c842C60775Ce37566D03B41A7A66C782";
const xFer = "0x6b82eAce10F782487B61C616B623A78c965Fdd88";
const xFerBoost = "0xCf3e157E2491F7D739f8923f6CeaA4656E64C92e";
const chef = "0xAB50FB1117778f293cc33aC044b5579fb03029D0";
const factoryUrl = "https://api.ferroprotocol.com/info/api/getApys";

const getFerroApys = async () => {
  const farmApys = await getFarmApys();
  const tradingApys = await getTradingApys();

  return getApyBreakdown(pools, tradingApys, farmApys, lpFee);
}

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
}

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
  const { blockRewards, totalAllocPoint, xFerAllocPoint, xFerToFer, xFerBoostTotalSupply } = await getMasterChefData();
  const { balances, allocPoints, strategyBalances, xFerBoostBalances } = await getPoolsData();

  const secondsPerBlock = await getBlockTime(chainId);

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
      .times(12)  // strategy only holds upto 30 days of vested rewards
      .times(xFerToFer)
      .dividedBy(100);  // 100 xFerBoost to 1 xFer

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
  const masterchefContract = getContractWithProvider(chefAbi, chef, web3);
  const xFerContract = getContractWithProvider(ERC20, xFer, web3);
  const ferContract = getContractWithProvider(ERC20, fer, web3);
  const xFerBoostContract = getContractWithProvider(ERC20, xFerBoost, web3);

  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const chefCalls = [];
  const xFerCalls = [];
  const ferCalls = [];
  const xFerBoostCalls = [];

  chefCalls.push({
    blockRewards: masterchefContract.methods.ferPerBlock(),
    totalAllocPoint: masterchefContract.methods.totalAllocPoint(),
    xFerPoolInfo: masterchefContract.methods.poolInfo(0),
  });
  xFerCalls.push({ totalSupply: xFerContract.methods.totalSupply() });
  ferCalls.push({ balance: ferContract.methods.balanceOf(xFer) });
  xFerBoostCalls.push({ totalSupply: xFerBoostContract.methods.totalSupply() });

  const res = await multicall.all([chefCalls, xFerCalls, ferCalls, xFerBoostCalls]);

  const blockRewards = new BigNumber(res[0].map(v => v.blockRewards));
  const totalAllocPoint = new BigNumber(res[0].map(v => v.totalAllocPoint));
  const xFerAllocPoint = new BigNumber(res[0].map(v => v.xFerPoolInfo['1']));

  const xFerTotalSupply = new BigNumber(res[1].map(v => v.totalSupply));
  const ferBalance = new BigNumber(res[2].map(v => v.balance));
  const xFerToFer = ferBalance.dividedBy(xFerTotalSupply);

  const xFerBoostTotalSupply = new BigNumber(res[3].map(v => v.totalSupply));

  return { blockRewards, totalAllocPoint, xFerAllocPoint, xFerToFer, xFerBoostTotalSupply };
};

const getPoolsData = async () => {
  const masterchefContract = getContractWithProvider(chefAbi, chef, web3);
  const xFerBoostContract = getContractWithProvider(ERC20, xFerBoost, web3);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const balanceCalls = [];
  const allocPointCalls = [];
  const strategyCalls = [];
  const xFerBoostCalls = [];

  pools.forEach(pool => {
    const tokenContract = getContractWithProvider(ERC20, pool.address, web3);
    const strategyContract = getContractWithProvider(strategyAbi, pool.strategy, web3);

    balanceCalls.push({ balance: tokenContract.methods.balanceOf(chef) });
    allocPointCalls.push({ allocPoint: masterchefContract.methods.poolInfo(pool.poolId) });
    strategyCalls.push({ balance: strategyContract.methods.balanceOfPool() })
    xFerBoostCalls.push({ balance: xFerBoostContract.methods.balanceOf(pool.strategy) });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls, strategyCalls, xFerBoostCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['1']);
  const strategyBalances = res[2].map(v => new BigNumber(v.balance));
  const xFerBoostBalances = res[3].map(v => new BigNumber(v.balance));

  return { balances, allocPoints, strategyBalances, xFerBoostBalances };
};

module.exports = getFerroApys;
