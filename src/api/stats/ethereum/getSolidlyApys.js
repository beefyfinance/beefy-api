const { ethereumWeb3: web3 } = require('../../../utils/web3');
const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/ethereum/solidlyStableLpPools.json');
const volatilePools = require('../../../data/ethereum/solidlyLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  ethereum: {
    tokens: { SOLID },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getSolidlyApys = async () =>
  getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'SOLID',
    oracle: 'tokens',
    decimals: '1e18',
    reward: SOLID.address,
    boosted: true,
    //log: true,
  });

module.exports = getSolidlyApys;
