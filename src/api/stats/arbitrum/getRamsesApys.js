const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/src/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/arbitrum/ramsesStableLpPools.json');
const volatilePools = require('../../../data/arbitrum/ramsesLpPools.json');

const {
  arbitrum: {
    platforms: { ramses },
    tokens: { RAM },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getRamsesApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'RAM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: RAM.address,
    spirit: false,
    // log: true,
  });
};

module.exports = getRamsesApys;
