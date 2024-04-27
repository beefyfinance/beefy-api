import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/base/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-base';

export const getBeefyBaseCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.base);
};
