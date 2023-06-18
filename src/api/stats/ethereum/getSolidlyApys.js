const { ETH_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
import ISolidlyGaugeV2 from '../../../abis/ISolidlyGaugeV2.json';
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
    chainId: chainId,
    pools: pools,
    oracleId: 'SOLID',
    oracle: 'tokens',
    decimals: '1e18',
    reward: SOLID.address,
    // log: true,
    abi: ISolidlyGaugeV2,
  });

module.exports = getSolidlyApys;
