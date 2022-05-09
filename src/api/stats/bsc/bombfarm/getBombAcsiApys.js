const { bscWeb3: web3, multicallAddress, web3Factory } = require('../../../../utils/web3');
const BigNumber = require('bignumber.js');
const ERC20 = require('../../../../abis/ERC20.json');
const RewardPool = require('../../../../abis/BombReward.json');
const pools = require('../../../../data/bombAcsiPools.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalLpStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { getTradingFeeApr } = require('../../../../utils/getTradingFeeApr');
const { acsiClient, cakeClient } = require('../../../../apollo/client');
import { BSC_CHAIN_ID, SPOOKY_LPF } from '../../../../constants';
import getApyBreakdown from '../../common/getApyBreakdown';
import getBalancerPrices from '../../common/getBalancerPrices';
//const SPOOKY_LPF = 0.0017;
import { bombMaxi } from './graph/fetchers/pools';

const rewardPool = '0x1083926054069AaD75d7238E9B809b0eF9d94e5B';
const oracleId = 'BSHARE';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getBombAcsiApys = async () => {
  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(rewardPool, pool)));
  const farmAprs = await Promise.all(promises);

  const pairAddresses = pools.map(pool => pool.address);
  // console.log('pairAddresses', pairAddresses);

  const tradingAprs = await getTradingFeeApr(cakeClient, pairAddresses, SPOOKY_LPF);
  // console.log('pools', tradingAprs);
  return getApyBreakdown(pools, tradingAprs, farmAprs, SPOOKY_LPF);
};

const getPoolApy = async (rewardPool, pool) => {
  // console.log('acsi', pool);
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool, pool.poolId),
    getTotalAcsiStakedInUsd(rewardPool, pool),
  ]);

  // console.log('totalStakedInUsd pool: ', pool.poolId, Number(totalStakedInUsd));
  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getBombMaxiStats = async poolId => {
  const bombMaxistat = await bombMaxi(poolId);
  return {
    totalShares: bombMaxistat.data.pool.totalShares.toString(),
    totalLiquidity: bombMaxistat.data.pool.totalLiquidity.toString(),
  };
};

const getMaxiLPTokenPrice = async maxiPool => {
  const bombmaxi = await getBombMaxiStats(maxiPool);
  const totalShares = await bombmaxi.totalShares;
  //Get amount of tokenA
  const totalLiquidity = await bombmaxi.totalLiquidity;
  // const stat = isBomb === true ? await this.getBombStat() : await this.getShareStat();

  const tokenInLP = Number(totalLiquidity) / Number(totalShares);
  const tokenPrice = tokenInLP //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
    .toString();
  return tokenPrice;
};

const getTotalAcsiStakedInUsd = async (rewardPool, pool) => {
  const rewardPoolContract = new web3.eth.Contract(RewardPool, rewardPool);
  //const web3 = web3Factory(BSC_CHAIN_ID);
  const tokenContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(rewardPool).call());
  const bombMaxiLpPrice = await getMaxiLPTokenPrice(pool.vaultPoolId);
  // const totalShares = await bombmaxi.totalShares;
  // const totalLiquidity = await bombmaxi.totalLiquidity;
  // const tokenInLP = Number(totalLiquidity) / Number(totalShares);

  console.log({ bombMaxiLpPrice });
  // console.log({ test2 });
  // console.log({ result });

  return totalStaked.times(bombMaxiLpPrice);
};

const getYearlyRewardsInUsd = async (rewardPool, poolId) => {
  const rewardPoolContract = new web3.eth.Contract(RewardPool, rewardPool);

  let { allocPoint } = await rewardPoolContract.methods.poolInfo(poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const fromTime = Math.floor(Date.now() / 1000);
  let [secondRewards, totalAllocPoint] = await Promise.all([
    rewardPoolContract.methods.getGeneratedReward(fromTime, fromTime + 1).call(),
    rewardPoolContract.methods.totalAllocPoint().call(),
  ]);

  secondRewards = new BigNumber(secondRewards);
  totalAllocPoint = new BigNumber(totalAllocPoint);

  const secondsPerYear = 31536000;
  const yearlyRewards = secondRewards
    .times(secondsPerYear)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const price = await fetchPrice({ oracle: oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(price).dividedBy(DECIMALS);
  // console.log('yearlyRewardsInUsd pool: ', poolId, Number(yearlyRewardsInUsd));

  return yearlyRewardsInUsd;
};

module.exports = getBombAcsiApys;
