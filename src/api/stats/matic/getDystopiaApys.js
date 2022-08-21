const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/matic/dystopiaStableLpPools.json');
const volatilePools = require('../../../data/matic/dystopiaLpPools.json');

const {
  polygon: {
    platforms: { dystopia, beefyfinance },
    tokens: { DYST },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getDystopiaApys = async () => {
  return getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'DYST',
    oracle: 'tokens',
    decimals: '1e36', // token is 1e18 but gauge.rewardRate returns 1e36
    reward: DYST.address,
    boosted: true,
    NFTid: 7,
    ve: dystopia.ve,
    gaugeStaker: dystopia.gaugeStaker,
    // log: true,
  });
};

module.exports = getDystopiaApys;
