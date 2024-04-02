import { getCowApy } from '../common/getCowVaultApys';
const pools = require('../../../data/base/beefyCowVaults.json');

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-base';

const vaultMapping = pools.reduce((mapping, pool) => {
  mapping[pool.address.toLowerCase()] = pool.oracleId;
  return mapping;
}, {});

export const getBeefyBaseCowApys = async () => {
  return await getCowApy(SUBGRAPH, vaultMapping);
};
