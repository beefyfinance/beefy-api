import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/arbitrum/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-arbitrum';

const vaultMapping = pools.reduce((mapping, pool) => {
  mapping[pool.address.toLowerCase()] = pool.oracleId;
  return mapping;
}, {});

export const getBeefyArbCowApys = async () => {
  return await getCowApy(SUBGRAPH, vaultMapping);
};
