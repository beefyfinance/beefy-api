const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/quickLpPools.json');
const { BASE_HPY, POLYGON_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { quickClient } = require('../../../apollo/client');

const oracle = 'tokens';
const oracleId = 'QUICK';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const quickLiquidityProviderFee = 0.003;

const getQuickLpApys = async () => {
  let apys = {};

  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(quickClient, pairAddresses, quickLiquidityProviderFee);
  const farmApys = await getFarmApys(pools);

  pools.forEach((pool, i) => {
    const simpleApy = farmApys[i];
    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);
    apys = { ...apys, ...{ [pool.name]: apy } };
  });

  return apys;
};

const getFarmApys = async pools => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = rewardRates[i].times(3).times(BLOCKS_PER_DAY).times(365);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    apys.push(yearlyRewardsInUsd.dividedBy(totalStakedInUsd));
  }
  return apys;
};

const getPoolsData = async pools => {
  const multicall = new MultiCall(web3, multicallAddress(POLYGON_CHAIN_ID));
  const balanceCalls = [];
  const rewardRateCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.rewardPool),
    });
    const rewardPool = new web3.eth.Contract(IRewardPool, pool.rewardPool);
    rewardRateCalls.push({
      rewardRate: rewardPool.methods.rewardRate(),
    });
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => new BigNumber(v.rewardRate));
  return { balances, rewardRates };
};

module.exports = getQuickLpApys;
