const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const NetworkRewards = require('../../../abis/matic/NetworkRewards.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/50kLpPools.json');
const { POLYGON_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { quickClient } = require('../../../apollo/client');
import getApyBreakdown from '../common/getApyBreakdown';

const rewards = '0x975601b1f21d3688EC853f25821Ce9DAd62c5E1d';
const oracleId = '50K';
const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;
const liquidityProviderFee = 0.003;
const unlockedRewards = 0.2;

const get50kLpApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, liquidityProviderFee);
  const farmApys = await getFarmApys(pools);

  return getApyBreakdown(pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getFarmApys = async pools => {
  const apys = [];
  const rewardsContract = new web3.eth.Contract(NetworkRewards, rewards);
  const period = await rewardsContract.methods.currentPeriod().call();
  const rewardPerBlock = new BigNumber(
    await rewardsContract.methods.arrRewardPerBlock(period).call()
  );
  const totalAllocPoint = new BigNumber(await rewardsContract.methods.totalAllocPoint().call());

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, allocPoints } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerBlock.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
    //  console.log(pool.name, 'staked:', totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), apy.valueOf());
  }
  return apys;
};

const getPoolsData = async pools => {
  const rewardsContract = new web3.eth.Contract(NetworkRewards, rewards);

  const balanceCalls = [];
  const allocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(rewards),
    });
    allocPointCalls.push({
      allocPoint: rewardsContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const res = await multicall.all([balanceCalls, allocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['1']);
  return { balances, allocPoints };
};

module.exports = { get50kLpApys, liquidityProviderFee };
