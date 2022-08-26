const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/fantom/spiritStableLpPools.json');
const volatilePools = require('../../../data/fantom/spiritVolatileLpPools.json');

const {
  fantom: {
    platforms: { spiritswap, beefyfinance },
    tokens: { SPIRIT },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getSpiritV2Apys = async () => {
  return getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18', // token is 1e18 but gauge.rewardRate returns 1e36
    reward: SPIRIT.address,
    boosted: true,
    ve: spiritswap.ve,
    gaugeStaker: spiritswap.gaugeStaker,
    spirit: true,
    // log: true,
  });
};

module.exports = getSpiritV2Apys;
