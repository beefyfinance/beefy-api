const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { fuseWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/fuse/IVoltageMasterChef.json');
const SimpleRewarder = require('../../../abis/avax/SimpleRewarderPerSec.json'); // Voltage rewarder is equal to the avax one
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const voltageLpPools = require('../../../data/fuse/voltageLpPools.json');
const { BASE_HPY, FUSE_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { fusefiClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { FUSEFI_LPF } from '../../../constants';

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
const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getVoltageDualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { rewardPerSecond, totalAllocPoint } = await getMasterChefData();

  const pairAddresses = voltageLpPools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(fusefiClient, pairAddresses, liquidityProviderFee);

  const pools = [...voltageLpPools, ...xVOLT];
  const { balances, allocPoints, tokenPerSecData } = await getPoolsData(pools);

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
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.voltPerSec().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { rewardPerSecond, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FUSE_CHAIN_ID));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const tokenPerSecCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchef),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo[3]);
  const rewarders = res[1].map(v => v.poolInfo[4]);

  rewarders.forEach(rewarder => {
    let rewarderContract = new web3.eth.Contract(SimpleRewarder, rewarder);
    let tokenPerSec = rewarderContract.methods.tokenPerSec();
    tokenPerSecCalls.push({
      tokenPerSec: tokenPerSec,
    });
  });

  const tokenPerSecData = (await multicall.all([tokenPerSecCalls]))[0].map(
    t => new BigNumber(t.tokenPerSec)
  );

  return { balances, allocPoints, tokenPerSecData };
};

module.exports = getVoltageDualApys;
