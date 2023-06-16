import { getRewardPoolApys } from '../common/getRewardPoolApys';

const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
const volatilePools = require('../../../data/matic/pearlLpPools.json');
const stablePools = require('../../../data/matic/pearlStableLpPools.json');

const pools = [...volatilePools, ...stablePools];
export const getPearlApys = async () => {
  return getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'PEARL',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
