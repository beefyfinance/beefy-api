const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { cronosWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/cronos/Craftsman.json');
const MasterChefV2 = require('../../../abis/cronos/CraftsmanV2.json');
const VVSRewarder = require('../../../abis/cronos/VVSRewarder.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/cronos/vvsDualLpPools.json');
const { BASE_HPY, CRONOS_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { vvsClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import getBlockTime from '../../../utils/getBlockTime';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

const masterchef = '0xDccd6455AE04b03d785F12196B492b18129564bc';
const masterchefV2 = '0xbc149c62EFe8AFC61728fC58b1b66a0661712e76';
const oracleIdA = 'VVS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const liquidityProviderFee = 0.003;

const getVvsDualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const secondsPerBlock = await getBlockTime(CRONOS_CHAIN_ID);
  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, tokenPerSecData, rewardEndData } = await getPoolsData(pools);

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(vvsClient, pairAddresses, liquidityProviderFee);

  const currentTimestamp = new BigNumber(Math.floor(Date.now() / 1000));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!tokenPerSecData[i].isNaN() && rewardEndData[i].isGreaterThan(currentTimestamp)) {
      let tokenBPerSec = tokenPerSecData[i];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = tokenBPerSec.times(secondsPerYear);
      yearlyRewardsBInUsd = yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
    }

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
    const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const totalApy = getFarmWithTradingFeesApy(
      simpleApy,
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
        lpFee: liquidityProviderFee,
        tradingApr: tradingApr.toNumber(),
        totalApy: totalApy,
      },
    };

    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.vvsPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChef, masterchef);
  const masterchefV2Contract = getContract(MasterChefV2, masterchefV2);
  const multicall = new MultiCall(web3, multicallAddress(CRONOS_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const tokenPerSecCalls = [];
  const rewarderCalls = [];
  const rewardEndCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
    let rewarder = masterchefV2Contract.methods.poolRewarders(pool.poolId);
    rewarderCalls.push({
      rewarder: rewarder,
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls, rewarderCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo[1]);
  const rewarders = res[2].map(v => v.rewarder[0]);

  rewarders.forEach(rewarder => {
    let rewarderContract = getContract(VVSRewarder, rewarder);

    let rewardEndTimestamp = rewarderContract.methods.rewardEndTimestamp();
    rewardEndCalls.push({
      rewardEndTimestamp: rewardEndTimestamp,
    });

    let tokenPerSec = rewarderContract.methods.rewardPerSecond();
    tokenPerSecCalls.push({
      tokenPerSec: tokenPerSec,
    });
  });

  const resRewards = await multicall.all([rewardEndCalls, tokenPerSecCalls]);

  const rewardEndData = resRewards[0].map(t => new BigNumber(t.rewardEndTimestamp));
  const tokenPerSecData = resRewards[1].map(t => new BigNumber(t.tokenPerSec));

  return { balances, allocPoints, tokenPerSecData, rewardEndData };
};

module.exports = getVvsDualApys;
