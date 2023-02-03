import { MultiCall } from 'eth-multicall';
import getApyBreakdown from '../common/getApyBreakdown';
import { getCurveBaseApys } from '../common/curve/getCurveApyData';
import { getCurveApysCommon } from '../common/curve/getCurveApysCommon';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { avaxWeb3 as web3, multicallAddress } from '../../../utils/web3';

const pools = require('../../../data/avax/curvePools.json').filter(p => p.gauge && !p.convex);
const baseApyUrl = 'https://api.curve.fi/api/getSubgraphData/avalanche';
const tradingFees = 0.0002;

export const getCurveApys = async () => {
  const baseApys = await getCurveBaseApys(pools, baseApyUrl);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const farmApys = await getCurveApysCommon(web3, multicall, pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};
