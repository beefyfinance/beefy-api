const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { moonriverWeb3: web3, multicallAddress } = require('../../../utils/web3');

const SushiMiniChefV2 = require('../../../abis/matic/SushiMiniChefV2.json');
const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/moonriver/sushiLpPools.json');
const { MOONRIVER_CHAIN_ID, SUSHI_LPF } = require('../../../constants');
const { getTradingFeeAprSushi: getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { sushiMoonriverClient } = require('../../../apollo/client');
import getApyBreakdown from '../common/getApyBreakdown';

const minichef = '0x3dB01570D97631f69bbb0ba39796865456Cf89A5';
const oracleId = 'mSUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerYear = 31536000;
const secondsPerBlock = 1;

// movr
const complexRewarderTime = '0x1334c8e873E1cae8467156e2A81d1C8b566B2da1';
const oracleIdMovr = 'WMOVR';

const getSushiLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(sushiMoonriverClient, pairAddresses, SUSHI_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);
  const sushiPerSecond = new BigNumber(await minichefContract.methods.sushiPerSecond().call());
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());

  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);
  const rewardPerSecond = new BigNumber(await rewardContract.methods.rewardPerSecond().call());
  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 10000;

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const movrPrice = await fetchPrice({ oracle, id: oracleIdMovr });
  const { balances, allocPoints, rewardAllocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = sushiPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const allocPoint = rewardAllocPoints[i];
    const movrRewards = rewardPerSecond.times(allocPoint).dividedBy(hardcodedTotalAllocPoint);
    const yearlyMovrRewards = movrRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const movrRewardsInUsd = yearlyMovrRewards.times(movrPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(movrRewardsInUsd).dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);
  const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, complexRewarderTime);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
    rewardAllocPointCalls.push({
      allocPoint: rewardContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(MOONRIVER_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls, rewardAllocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  const rewardAllocPoints = res[2].map(v => v.allocPoint['2']);
  return { balances, allocPoints, rewardAllocPoints };
};

module.exports = { getSushiLpApys, SUSHI_LPF };
