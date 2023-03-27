import BigNumber from 'bignumber.js';
import { MultiCall } from 'eth-multicall';
import getApyBreakdown from '../common/getApyBreakdown';
import { ethereumWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { ETH_CHAIN_ID as chainId } from '../../../constants';
import { getConvexApys } from './getConvexApys';
import { getContract } from '../../../utils/contractHelper';
import IConicPool from '../../../abis/ethereum/IConicPool.json';
import InflationManager from '../../../abis/ethereum/IConicInflation.json';
import fetchPrice from '../../../utils/fetchPrice';
import convexPools from '../../../data/ethereum/convexPools.json';
import pools from '../../../data/ethereum/conicPools.json';

const secondsPerYear = 31536000;
const inflationManager = '0xf4A364d6B513158dC880d0e8DA6Ae65B9688FD7B';

export const getConicApys = async () => {
  const convexApys = (await getConvexApys()).apyBreakdowns;

  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const inflation = getContract(InflationManager, inflationManager);
  const inflationCalls = pools.map(pool => ({
    cncRate: inflation.methods.getCurrentPoolInflationRate(pool.address),
  }));
  const poolCalls = pools.map(pool => {
    const conicPool = getContract(IConicPool, pool.address);
    return {
      totalSupply: conicPool.methods.totalUnderlying(),
      weights: conicPool.methods.getWeights(),
    };
  });
  const res = await multicall.all([inflationCalls, poolCalls]);

  const aprs = [];
  const tradingAprs = {};
  const cncPrice = await fetchPrice({ oracle: 'tokens', id: 'CNC' });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const cncRate = new BigNumber(res[0][i].cncRate);
    const cncRewardsInUsd = cncRate.times(secondsPerYear).times(cncPrice).div('1e18');

    const tokenPrice = await fetchPrice({ oracle: 'tokens', id: pool.underlying });
    const totalSupply = new BigNumber(res[1][i].totalSupply);
    const totalStakedInUsd = totalSupply.times(tokenPrice).div(pool.decimals);

    let apr = cncRewardsInUsd.div(totalStakedInUsd);
    // console.log(pool.name, 'cnc apr', apr.toNumber(), totalStakedInUsd.toNumber(), tokenPrice);
    let tradingApr = new BigNumber(0);

    const weights = res[1][i].weights;
    for (const [curvePool, weight] of weights) {
      const convexPool = convexPools.find(p => p.pool === curvePool);
      if (convexPool) {
        const w = new BigNumber(weight).div('1e18').toNumber();
        const convexData = convexApys[convexPool.name];
        const convexApr = convexData.vaultApr / (1 - convexData.beefyPerformanceFee);
        // console.log(pool.name, convexPool.name, w, convexApr, convexApr * w, convexData.tradingApr * w);
        apr = apr.plus(convexApr * w);
        tradingApr = tradingApr.plus(convexData.tradingApr * w);
      } else {
        console.error('conic convex pool not found', curvePool);
      }
    }
    aprs.push(apr);
    tradingAprs[pool.address.toLowerCase()] = tradingApr;
  }

  return getApyBreakdown(pools, tradingAprs, aprs, 0);
};
