import { MultiCall } from 'eth-multicall';
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApysOld } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { moonbeamWeb3 as web3, multicallAddress } from '../../../utils/web3';

const pools = require('../../../data/moonbeam/curvePools.json').filter(p => p.gauge && !p.convex);
// const baseApyUrl = 'https://stats.curve.fi/raw-stats-moonbeam/apys.json';
const baseApyUrl = '';
const factoryApyUrl = 'https://api.curve.fi/api/getFactoryAPYs-moonbeam';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  // const baseApys = await getCurveBaseApys(pools, subgraphUrl);
  const baseApys = await getCurveBaseApysOld(pools, baseApyUrl, factoryApyUrl);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const farmApys = await getCurveApysCommon(web3, multicall, pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
