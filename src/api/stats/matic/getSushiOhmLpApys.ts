const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/sushiOhmLpPools.json');
const { POLYGON_CHAIN_ID, SUSHI_LPF } = require('../../../constants');
const { getTradingFeeAprSushi: getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { sushiPolyClient } = require('../../../apollo/client');
import ERC20Abi from '../../../abis/ERC20Abi';
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';

const minichef = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
const oracleId = 'SUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const getSushiOhmLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeApr(sushiPolyClient, pairAddresses, SUSHI_LPF),
    getFarmApys(pools),
  ]);

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = fetchContract(minichef, SushiMiniChefV2, POLYGON_CHAIN_ID);
  const [sushiPerSecond, totalAllocPoint, { balances, allocPoints, rewardsPerSecond }] =
    await Promise.all([
      minichefContract.read.sushiPerSecond().then(v => new BigNumber(v.toString())),
      minichefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
      getPoolsData(pools),
    ]);

  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 1000;

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const ohmPrice = await fetchPrice({ oracle, id: pool.secondOracleId });

    const rewardPerSecond = rewardsPerSecond[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = sushiPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
    const yearlyOhmRewards = rewardPerSecond.dividedBy(secondsPerBlock).times(secondsPerYear);
    const ohmRewardsInUsd = yearlyOhmRewards.times(ohmPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(ohmRewardsInUsd).dividedBy(totalStakedInUsd);

    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = fetchContract(minichef, SushiMiniChefV2, POLYGON_CHAIN_ID);

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardPerSecondCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, POLYGON_CHAIN_ID);
    const rewardContract = fetchContract(pool.rewarder, SushiComplexRewarderTime, POLYGON_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([minichef]));
    allocPointCalls.push(minichefContract.read.poolInfo([pool.poolId]));
    rewardPerSecondCalls.push(rewardContract.read.rewardPerSecond());
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewardPerSecondCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => v['2'].toString());
  const rewardsPerSecond = res[2].map(v => new BigNumber(v.toString()));
  return { balances, allocPoints, rewardsPerSecond };
};

module.exports = { getSushiOhmLpApys };
