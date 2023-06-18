const { KAVA_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/kava/equilibreStableLpPools.json');
const volatilePools = require('../../../data/kava/equilibreLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  kava: {
    tokens: { VARA },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getEquilibreApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VARA',
    oracle: 'tokens',
    decimals: getEDecimals(VARA.decimals),
    reward: VARA.address,
    boosted: false,
    // log: true,
  });
};

module.exports = getEquilibreApys;
