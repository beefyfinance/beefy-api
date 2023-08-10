const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const volatilePools = require('../../../data/canto/cvmLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const { CVM } = addressBook.canto.tokens;

const pools = [...volatilePools];
const getCvmApys = async () =>
  getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'oCVM',
    oracle: 'tokens',
    decimals: '1e18',
    reward: CVM.address,
    // log: true,
  });

module.exports = getCvmApys;
