const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/canto/cvmStableLpPools.json');
const volatilePools = require('../../../data/canto/cvmLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    tokens: { CVM },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getCvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oCVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: CVM.address,
    boosted: false,
    // log: true,
  });

module.exports = getCvmApys;
