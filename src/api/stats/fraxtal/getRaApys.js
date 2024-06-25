const { FRAXTAL_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/src/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/fraxtal/raStablePools.json');
const volatilePools = require('../../../data/fraxtal/raPools.json');

const {
  fraxtal: {
    tokens: { FXS },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getRaApys = async () => {
  return getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FXS',
    oracle: 'tokens',
    decimals: '1e18',
    reward: FXS.address,
    ramses: true,
    // log: true,
  });
};

module.exports = getRaApys;
