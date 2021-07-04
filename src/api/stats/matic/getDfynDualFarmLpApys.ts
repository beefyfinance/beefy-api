import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import { polygonWeb3 as web3, multicallAddress } from '../../../utils/web3';

import IStakingRewards from '../../../abis/IStakingRewards.json';
import ERC20 from '../../../abis/ERC20.json';
import fetchPrice from '../../../utils/fetchPrice';
import pools from '../../../data/matic/dfynLpPools.json';
import { DFYN_LPF, POLYGON_CHAIN_ID } from '../../../constants';
import { getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import getFarmWithTradingFeesApy from '../../../utils/getFarmWithTradingFeesApy';
import { dfynClient } from '../../../apollo/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { addressBook } from 'blockchain-addressbook';
const {
  polygon: { tokens },
} = addressBook;

const oracle = 'tokens';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getDfynDualFarmLpApys = async () => {
  const dualFarms = pools.filter(pool => pool.farmType === 'dual');
  const pairAddresses = dualFarms.map(pool => pool.address);
  const tradingAprs = (await getTradingFeeApr(dfynClient, pairAddresses, DFYN_LPF)) as Record<
    string,
    BigNumber
  >;
  const farmApys = await getFarmApys(dualFarms);

  return getApyBreakdown(dualFarms, tradingAprs, farmApys, DFYN_LPF);
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
    tokenSymbol => tokens[tokenSymbol]
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

module.exports = { getDfynDualFarmLpApys };
