import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/optimism/beefyCowVaults.json');

const SUBGRAPH =
  'https://api.goldsky.com/api/public/project_clu2walwem1qm01w40v3yhw1f/subgraphs/beefy-clm-optimism/latest/gn';

export const getBeefyOPCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.optimism);
};
