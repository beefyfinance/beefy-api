import { getRewardPoolApys } from '../common/getRewardPoolApys';

const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const volatilePools = require('../../../data/arbitrum/chronosLpPools.json');
const stablePools = require('../../../data/arbitrum/chronosStableLpPools.json');

const pools = [...volatilePools, ...stablePools];
export const getChronosApys = async () => {
  return getRewardPoolApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'CHR',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
