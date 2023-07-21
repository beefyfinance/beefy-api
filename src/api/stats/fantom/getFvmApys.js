const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/fantom/fvmStableLpPools.json');
const volatilePools = require('../../../data/fantom/fvmLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fantom: {
    tokens: { FVM },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getFvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oFVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FVM.address,
    boosted: false,
    // log: true,
  });

module.exports = getFvmApys;
