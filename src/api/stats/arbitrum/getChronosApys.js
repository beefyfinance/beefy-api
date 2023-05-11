import { getRewardPoolApys } from '../common/getRewardPoolApys';

const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
const volatilePools = require('../../../data/arbitrum/chronosLpPools.json');
// const stablePools = require('../../../data/arbitrum/chronosStableLpPools.json');

// const pools = [...volatilePools, ...stablePools];
const pools = [...volatilePools];
export const getChronosApys = async () => {
  return getRewardPoolApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'CHR',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });
};
