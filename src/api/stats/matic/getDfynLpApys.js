const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/dfynLpPools.json');
const { POLYGON_CHAIN_ID, DFYN_LPF } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const { dfynClient } = require('../../../apollo/client');
import getApyBreakdown from '../common/getApyBreakdown';

const oracle = 'tokens';
const oracleId = 'DFYN';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getDfynLpApys = async () => {
  const popularFarms = pools.filter(pool => pool.farmType === 'popular' || pool.farmType === 'eco');
  const pairAddresses = popularFarms.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(dfynClient, pairAddresses, DFYN_LPF);

  const farmApys = await getFarmApys(popularFarms);

  return getApyBreakdown(popularFarms, tradingAprs, farmApys, DFYN_LPF);
};

const getFarmApys = async pools => {
  const apys = [];
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const yearlyRewards = rewardRates[i].times(3).times(BLOCKS_PER_DAY).times(365).dividedBy(2);
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

module.exports = { getDfynLpApys, DFYN_LPF };
