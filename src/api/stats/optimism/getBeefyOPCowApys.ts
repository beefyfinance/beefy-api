import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/optimism/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-optimism';

const vaultMapping = pools.reduce((mapping, pool) => {
  mapping[pool.address.toLowerCase()] = pool.oracleId;
  return mapping;
}, {});

export const getBeefyOPCowApys = async () => {
  return await getCowApy(SUBGRAPH, vaultMapping);
};
