const { zksyncWeb3: web3 } = require('../../../utils/web3');
const { ZKSYNC_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/zksync/veSyncStableLpPools.json');
const volatilePools = require('../../../data/zksync/veSyncLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  zksync: {
    tokens: { VS },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getveSyncApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'VSzk',
    oracle: 'tokens',
    decimals: getEDecimals(VS.decimals),
    reward: VS.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getveSyncApys error', result.reason);
    } else {
      apys = { ...apys, ...result.value.apys };
      apyBreakdowns = { ...apyBreakdowns, ...result.value.apyBreakdowns };
    }
  }

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = getveSyncApys;
