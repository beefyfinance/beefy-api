import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/optimism/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-optimism';

export const getBeefyOPCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.optimism);
};
