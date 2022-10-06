const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');

const Strat = require('../../../abis/StratUniV3.json');
const fetchPrice = require('../../../utils/fetchPrice');
import getApyBreakdown from './getApyBreakdown';
import { getContract } from '../../../utils/contractHelper';
import { uniswapPositionQuery } from '../../../apollo/queries';
import getBlockNumber from '../../../utils/getBlockNumber';
import getBlockTime from '../../../utils/getBlockTime';

export const getUniV3Apys = async params => {
  const tradingApys = await getTradingApys(params);

  return getApyBreakdown(params.pools, tradingApys, 0, 0);
};

const getTradingApys = async params => {
  const { liquiditys } = await getPoolsData(params);
  const blockNumber = await getBlockNumber(params.chainId);
  const blockTime = await getBlockTime(params.chainId);
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
  const web3 = params.web3;
  const multicall = new MultiCall(web3, multicallAddress(params.chainId));
  const calls = [];
  params.pools.forEach(pool => {
    const strat = getContract(Strat, pool.strategy);
    calls.push({
      liquidity: strat.methods.balanceOfPool(),
    });
  });

  const res = await multicall.all([calls]);

  const liquiditys = res[0].map(v => new BigNumber(v.liquidity));

  return { liquiditys };
};

module.exports = { getUniV3Apys };
