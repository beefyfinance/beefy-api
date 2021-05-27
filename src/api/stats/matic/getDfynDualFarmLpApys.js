const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { polygonWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IStakingRewards = require('../../../abis/IStakingRewards.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/DfynLpPools.json');
const { BASE_HPY, POLYGON_CHAIN_ID } = require('../../../constants');
const { getTradingFeeApr } = require('../../../utils/getTradingFeeApr');
const getFarmWithTradingFeesApy = require('../../../utils/getFarmWithTradingFeesApy');
const { createGQLClient } = require('../../../apollo/client');
const { addressBook } = require('blockchain-addressbook');
const { tokens: polygonTokens } = addressBook.polygon;

const oracle = 'tokens';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const liquidityProviderFee = 0.003;
const client = createGQLClient('https://api.thegraph.com/subgraphs/name/ss-sonic/dfyn-v4');

const getDfynDualFarmLpApys = async () => {
  let apys = {};

  const dualFarms = pools.filter(pool => pool.farmType === 'dual');

  const pairAddresses = dualFarms.map(pool => pool.address);
  const tradingAprs = await getTradingFeeApr(client, pairAddresses, liquidityProviderFee);
  const farmApys = await getFarmApys(dualFarms);

  dualFarms.forEach((pool, i) => {
    const simpleApy = farmApys[i];
    const tradingApr = tradingAprs[pool.address.toLowerCase()] ?? new BigNumber(0);
    const apy = getFarmWithTradingFeesApy(simpleApy, tradingApr, BASE_HPY, 1, 0.955);
    apys = { ...apys, ...{ [pool.name]: apy } };
  });

  return apys;
};

const getFarmApys = async pools => {
  const apys = [];
  const { balances, rewardRates } = await getPoolsData(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const rewardTokens = getRewardTokensForPool(pool);
    const tokenPrices = await getRewardTokensPrices(rewardTokens);

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    let totalRewardsInUsd = new BigNumber(0);
    rewardTokens.forEach(token => {
      const rewardRatesForPool = rewardRates[i];
      const rewardRateForToken = rewardRatesForPool[token.symbol];
      const tokenPrice = tokenPrices[token.symbol];
      const yearlyRewards = rewardRateForToken.times(3).times(BLOCKS_PER_DAY).times(365);
      const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
      totalRewardsInUsd = totalRewardsInUsd.plus(yearlyRewardsInUsd);
    });

    apys.push(totalRewardsInUsd.dividedBy(totalStakedInUsd));
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
    const rewardPool = new web3.eth.Contract(IStakingRewards, pool.rewardPool);
    const rewardTokens = getRewardTokensForPool(pool);
    const callsObject = {};
    rewardTokens.forEach(token => {
      callsObject[token.symbol] = rewardPool.methods.tokenRewardRate(token.address);
    });
    rewardRateCalls.push(callsObject);
  });

  const res = await multicall.all([balanceCalls, rewardRateCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardRates = res[1].map(v => {
    const tokens = Object.keys(v);
    const out = {};
    tokens.forEach(token => {
      out[token] = new BigNumber(v[token]);
    });
    return out;
  });
  return { balances, rewardRates };
};

const getRewardTokensForPool = pool => {
  const rewardTokens = [pool.lp0.oracleId, pool.lp1.oracleId].map(
    tokenSymbol => polygonTokens[tokenSymbol]
  );
  return rewardTokens;
};

const getRewardTokensPrices = async rewardTokens => {
  const tokenToPriceMap = {};
  for (const token of rewardTokens) {
    const price = await fetchPrice({ oracle, id: token.symbol });
    tokenToPriceMap[token.symbol] = price;
  }
  return tokenToPriceMap;
};

module.exports = getDfynDualFarmLpApys;
