import { ChainId } from '../../../../packages/address-book/address-book';
import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/base/beefyCowVaults.json');

const SUBGRAPH =
  'https://api.goldsky.com/api/public/project_clu2walwem1qm01w40v3yhw1f/subgraphs/beefy-clm-base/latest/gn';

export const getBeefyBaseCowApys = async () => {
  return await getCowApy(SUBGRAPH, pools, ChainId.base);
};
