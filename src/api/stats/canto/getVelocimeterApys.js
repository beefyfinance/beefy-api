const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/canto/velocimeterStableLpPools.json');
const volatilePools = require('../../../data/canto/velocimeterLpPools.json');
const stableV2Pools = require('../../../data/canto/velocimeterV2StableLpPools.json');
const volatileV2Pools = require('../../../data/canto/velocimeterV2LpPools.json');

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    tokens: { FLOWV1, FLOW },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const poolsV2 = [...stableV2Pools, ...volatileV2Pools];
const getVelocimeterApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'FLOWV1',
    oracle: 'tokens',
    decimals: getEDecimals(FLOWV1.decimals),
    reward: FLOWV1.address,
    boosted: false,
    // log: true,
  });

  const gaugeV2Apys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: poolsV2,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: getEDecimals(FLOW.decimals),
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys, gaugeV2Apys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getVelocimeterApys error', result.reason);
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

module.exports = getVelocimeterApys;
