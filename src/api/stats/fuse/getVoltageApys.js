const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const voltageLpPools = require('../../../data/fuse/voltageLpPools.json');
const voltageStableLpPools = require('../../../data/fuse/voltageStableLpPools.json');
const { BASE_HPY, FUSE_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { fusefiClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { FUSEFI_LPF } from '../../../constants';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import SimpleRewarderPerSec from '../../../abis/avax/SimpleRewarderPerSec';
import IVoltageMasterChef from '../../../abis/fuse/IVoltageMasterChef';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const masterchef = '0xE3e184a7b75D0Ae6E17B58F5283b91B4E0A2604F';
const oracleIdA = 'VOLT';
const oracleA = 'tokens';
const DECIMALSA = '1e18';

const xVOLT = [
  {
    name: 'voltagev2-xvolt',
    address: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
    oracle: 'tokens',
    oracleId: 'xVOLT',
    decimals: '1e18',
    oracleB: 'tokens',
    oracleIdB: 'FUSE',
    decimalsB: '1e18',
    poolId: 11,
    chainId: 122,
  },
];

const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const liquidityProviderFee = FUSEFI_LPF;

const getVoltageApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });

  const pools = [...voltageLpPools, ...voltageStableLpPools, ...xVOLT];

  const [
    { rewardPerSecond, totalAllocPoint },
    tradingAprs,
    { balances, allocPoints, tokenPerSecData },
  ] = await Promise.all([
    getMasterChefData(),
    getTradingFeeApr(
      fusefiClient,
      voltageLpPools.map(pool => pool.address),
      liquidityProviderFee
    ),
    getPoolsData(pools),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({
      oracle: pool.oracle ?? 'lps',
      id: pool.oracleId ?? pool.name,
    });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);
    let yearlyRewardsBInUsd = new BigNumber(0);

    if (!tokenPerSecData[i].isNaN()) {
      let tokenBPerSec = tokenPerSecData[i];
      const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
      const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
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
  const masterchefContract = fetchContract(masterchef, IVoltageMasterChef, FUSE_CHAIN_ID);
  const [rewardPerSecond, totalAllocPoint] = await Promise.all([
    masterchefContract.read.voltPerSec().then(v => new BigNumber(v.toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, IVoltageMasterChef, FUSE_CHAIN_ID);
  const balanceCalls = [];
  const poolInfoCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, FUSE_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([masterchef]));
    poolInfoCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
  });

  const res = await Promise.all([Promise.all(balanceCalls), Promise.all(poolInfoCalls)]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[3].toString()));
  const rewarders = res[1].map(v => v[4]);

  const tokenPerSecCalls = rewarders.map(rewarder => {
    if (rewarder === '0x0000000000000000000000000000000000000000') return new BigNumber('NaN');
    const rewarderContract = fetchContract(rewarder, SimpleRewarderPerSec, FUSE_CHAIN_ID);
    return rewarderContract.read.tokenPerSec();
  });

  const tokenPerSecDataResuls = await Promise.all(tokenPerSecCalls);
  const tokenPerSecData = tokenPerSecDataResuls.map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, tokenPerSecData };
};

module.exports = getVoltageApys;
