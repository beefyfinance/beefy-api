const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from './getApyBreakdown';
import { uniswapPositionQuery } from '../../../apollo/queries';
import getBlockNumber from '../../../utils/getBlockNumber';
import getBlockTime from '../../../utils/getBlockTime';
import StratUniV3 from '../../../abis/StratUniV3';
import { fetchContract } from '../../rpc/client';

export const getUniV3Apys = async params => {
  const tradingApys = await getTradingApys(params);

  return getApyBreakdown(params.pools, tradingApys, 0, 0);
};

const getTradingApys = async params => {
  const [{ liquiditys }, blockNumber, blockTime] = await Promise.all([
    getPoolsData(params),
    getBlockNumber(params.chainId),
    getBlockTime(params.chainId),
  ]);
  const oneDay = 86400;
  const blocksPerDay = Math.round(oneDay / blockTime);
  const block = blockNumber - blocksPerDay;
  let apys = [];

  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];

    const token0Price = await fetchPrice({ oracle: pool.lp0.oracle, id: pool.lp0.oracleId });
    const token1Price = await fetchPrice({ oracle: pool.lp1.oracle, id: pool.lp1.oracleId });
    const earnedFees = await getPoolFeeData(params.client, pool.strategy, block);

    const oracle = pool.oracle ?? 'lps';
    const id = pool.oracleId ?? pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = liquiditys[i].times(stakedPrice).dividedBy('1e18');

    const yearlyRewardsToken0 = earnedFees.feeDataToken0.times(token0Price).times(365);
    const yearlyRewardsToken1 = earnedFees.feeDataToken1.times(token1Price).times(365);
    const yearlyRewards = yearlyRewardsToken0.plus(yearlyRewardsToken1);

    const apy = yearlyRewards.div(totalStakedInUsd);
    apys.push(apy);

    if (params.log) {
      console.log(
        pool.name,
        apy.toNumber(),
        totalStakedInUsd.valueOf(),
        yearlyRewards.valueOf(),
        block.valueOf()
      );
    }
  }
  return apys;
};

const getPoolFeeData = async (client, strategy, block) => {
  let feeDataToken0 = new BigNumber(0);
  let feeDataToken1 = new BigNumber(0);
  let data;
  try {
    data = await client.query({
      query: uniswapPositionQuery(strategy, block),
    });
  } catch (e) {
    console.error('> getUniswapV3Apy error', strategy);
  }

  data.data.positions.forEach(position => {
    feeDataToken0 = new BigNumber(position.collectedFeesToken0).plus(feeDataToken0);
    feeDataToken1 = new BigNumber(position.collectedFeesToken1).plus(feeDataToken1);
  });

  return {
    feeDataToken0,
    feeDataToken1,
  };
};

const getPoolsData = async params => {
  const calls = params.pools.map(pool => {
    const strat = fetchContract(pool.strategy, StratUniV3, params.chainId);
    return strat.read.balanceOfPool();
  });

  const res = await Promise.all(calls);

  const liquiditys = res.map(v => new BigNumber(v.toString()));

  return { liquiditys };
};

module.exports = { getUniV3Apys };
