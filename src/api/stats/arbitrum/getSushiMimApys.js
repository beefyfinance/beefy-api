const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const sushiDualPools = require('../../../data/arbitrum/sushiLpMimPools.json');
const sushiConstantProductPools = require('../../../data/arbitrum/sushiConstantProductLpPools.json');
const { ARBITRUM_CHAIN_ID, SUSHI_LPF } = require('../../../constants');
const { getTradingFeeAprSushi: getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { sushiArbitrumClient } = require('../../../apollo/client');
import ERC20Abi from '../../../abis/ERC20Abi';
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime';
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';

const pools = [...sushiDualPools, ...sushiConstantProductPools];

const minichef = '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3';
const oracleId = 'SUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const getSushiMimApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(sushiArbitrumClient, pairAddresses, SUSHI_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = fetchContract(minichef, SushiMiniChefV2, ARBITRUM_CHAIN_ID);

  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 8400;

  const [sushiPerSecondResult, totalAllocPointResult, poolData] = await Promise.all([
    minichefContract.read.sushiPerSecond(),
    minichefContract.read.totalAllocPoint(),
    getPoolsData(pools),
  ]);

  const sushiPerSecond = new BigNumber(sushiPerSecondResult.toString());
  const totalAllocPoint = new BigNumber(totalAllocPointResult.toString());

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints, rewardRates } = poolData;
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const spellPrice = await fetchPrice({ oracle, id: pool.secondOracleId });

    const rewardPerSecond = rewardRates[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = sushiPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
    const yearlySpellRewards = rewardPerSecond.dividedBy(secondsPerBlock).times(secondsPerYear);
    const spellRewardsInUsd = yearlySpellRewards.times(spellPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(spellRewardsInUsd).dividedBy(totalStakedInUsd);

    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async pools => {
  const minichefContract = fetchContract(minichef, SushiMiniChefV2, ARBITRUM_CHAIN_ID);

  const { balanceCalls, allocPointCalls } = pools.reduce(
    (acc, pool) => {
      const tokenContract = fetchContract(pool.address, ERC20Abi, ARBITRUM_CHAIN_ID);
      acc.balanceCalls.push(tokenContract.read.balanceOf([minichef]));
      acc.allocPointCalls.push(minichefContract.read.poolInfo([pool.poolId]));
      return acc;
    },
    { balanceCalls: [], allocPointCalls: [] }
  );

  const rewardCalls = pools.map(pool => {
    const rewardContract = fetchContract(
      pool.rewarder,
      SushiComplexRewarderTime,
      ARBITRUM_CHAIN_ID
    );
    return rewardContract.read.rewardPerSecond();
  });

  const [balanceResults, allocResults, rewardResults] = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewardCalls),
  ]);

  const balances = balanceResults.map(v => new BigNumber(v.toString()));
  const allocPoints = allocResults.map(v => new BigNumber(v[2].toString()));
  const rewardRates = rewardResults.map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, rewardRates };
};

module.exports = { getSushiMimApys, SUSHI_LPF };
