const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pool = require('../../../data/fantom/fBeetsPool.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import ERC20Abi from '../../../abis/ERC20Abi';
import BeethovenxChef from '../../../abis/fantom/BeethovenxChef';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
const { getYearlyBalancerPlatformTradingFees } = require('../../../utils/getTradingFeeApr');
const { beetClient } = require('../../../apollo/client');
const getBlockTime = require('../../../utils/getBlockTime');

const oracle = 'tokens';
const oracleId = 'BEETS';
const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const xToken = '0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.000375;
const liquidityProviderFeeShare = 0.15;

const getfBeetsApy = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const tokenContract = fetchContract(pool[0].address, ERC20Abi, FANTOM_CHAIN_ID);

  const [
    { rewardPerBlock, totalAllocPoint },
    { balance, allocPoint },
    secondsPerBlock,
    totalStakedInxToken,
  ] = await Promise.all([
    getMasterChefData(),
    getPoolData(),
    getBlockTime(250),
    tokenContract.read.balanceOf([xToken]).then(res => new BigNumber(res.toString())),
  ]);

  const totalStakedInxTokenInUsd = new BigNumber(totalStakedInxToken)
    .times(tokenPrice)
    .dividedBy(pool[0].decimals);

  const yearlyTradingFees = await getYearlyBalancerPlatformTradingFees(
    beetClient,
    liquidityProviderFeeShare
  );
  const totalStakedInUsd = balance.times(tokenPrice).dividedBy(pool[0].decimals);

  const poolRewards = rewardPerBlock.times(allocPoint).dividedBy(totalAllocPoint);
  const yearlyRewards = poolRewards.times(SECONDS_PER_YEAR).dividedBy(secondsPerBlock);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(pool[0].decimals);

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool[0].name);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const tradingApr = yearlyTradingFees.div(totalStakedInxTokenInUsd);
  const totalApy = getFarmWithTradingFeesApy(
    simpleApr,
    tradingApr,
    BASE_HPY,
    1,
    shareAfterBeefyPerformanceFee
  );
  const apys = { [pool[0].name]: totalApy };

  const apyBreakdowns = {
    [pool[0].name]: {
      vaultApr: vaultApr.toNumber(),
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: liquidityProviderFee,
      tradingApr: tradingApr.toNumber(),
      totalApy: totalApy,
    },
  };

  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);
  const [rewardPerBlock, totalAllocPoint] = await Promise.all([
    masterchefContract.read.beetsPerBlock().then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);
  return { rewardPerBlock, totalAllocPoint };
};

const getPoolData = async () => {
  const xTokenContract = fetchContract(xToken, ERC20Abi, FANTOM_CHAIN_ID);
  const tokenContract = fetchContract(pool[0].address, ERC20Abi, FANTOM_CHAIN_ID);
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);

  const [xBalance, xTotalSupply, tokensStakedInxToken, allocPoint] = await Promise.all([
    xTokenContract.read.balanceOf([masterchef]).then(res => new BigNumber(res.toString())),
    xTokenContract.read.totalSupply().then(res => new BigNumber(res.toString())),
    tokenContract.read.balanceOf([xToken]).then(res => new BigNumber(res.toString())),
    masterchefContract.read
      .poolInfo([pool[0].poolId])
      .then(res => new BigNumber(res[0].toString())),
  ]);
  const balance = new BigNumber(xBalance).times(tokensStakedInxToken).dividedBy(xTotalSupply);

  return { balance, allocPoint };
};

module.exports = getfBeetsApy;
