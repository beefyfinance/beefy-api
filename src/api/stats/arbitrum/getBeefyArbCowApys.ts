import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/arbitrum/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-arbitrum';

export const getBeefyArbCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.arbitrum);
};
