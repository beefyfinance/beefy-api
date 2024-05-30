import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/arbitrum/beefyCowVaults.json');

const SUBGRAPH =
  'https://api.goldsky.com/api/public/project_clu2walwem1qm01w40v3yhw1f/subgraphs/beefy-clm-arbitrum/latest/gn';

export const getBeefyArbCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.arbitrum);
};
