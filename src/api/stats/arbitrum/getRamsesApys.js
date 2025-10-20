const { ARBITRUM_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/src/address-book';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const {
  arbitrum: {
    platforms: { ramses },
    tokens: { RAM },
  },
} = addressBook;

const pools = [
  {
    name: 'ramses-aleth-frxeth',
    address: '0xfB4fE921F724f3C7B610a826c827F9F6eCEf6886',
    gauge: '0xC3f26d2Fa16129a8d4A5A0f94D25F2cdd9005CDb',
    decimals: '1e18',
    chainId: 42161,
    beefyFee: 0.095,
    rewards: [
      {
        address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        oracleId: 'ARB',
        decimals: '1e18',
      },
    ],
    lp0: {
      address: '0x17573150d67d820542EFb24210371545a4868B03',
      oracle: 'tokens',
      oracleId: 'alETH',
      decimals: '1e18',
    },
    lp1: {
      address: '0x178412e79c25968a32e89b11f63B33F733770c2A',
      oracle: 'tokens',
      oracleId: 'frxETH',
      decimals: '1e18',
    },
  },
];
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
