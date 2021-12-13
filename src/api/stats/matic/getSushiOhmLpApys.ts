const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const SushiMiniChefV2 = require('../../../abis/matic/SushiMiniChefV2.json');
const SushiComplexRewarderTime = require('../../../abis/matic/SushiComplexRewarderTime.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/sushiOhmLpPools.json');
const { POLYGON_CHAIN_ID, SUSHI_LPF } = require('../../../constants');
const { getTradingFeeAprSushi: getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { sushiClient } = require('../../../apollo/client');
import getApyBreakdown from '../common/getApyBreakdown';

const minichef = '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F';
const oracleId = 'SUSHI';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

const getSushiOhmLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(sushiClient, pairAddresses, SUSHI_LPF);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);
  const sushiPerSecond = new BigNumber(await minichefContract.methods.sushiPerSecond().call());
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());

  // totalAllocPoint is non public
  // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
  // hardcoding to the same value SushiSwap hardcoded to
  // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
  const hardcodedTotalAllocPoint = 1000;

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const ohmPrice = await fetchPrice({ oracle, id: pool.secondOracleId });

    const rewardContract = new web3.eth.Contract(SushiComplexRewarderTime, pool.rewarder);
    const rewardPerSecond = new BigNumber(await rewardContract.methods.rewardPerSecond().call());

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
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2, minichef);

  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  return { balances, allocPoints };
};

module.exports = { getSushiOhmLpApys };
