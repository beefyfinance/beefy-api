const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const volatileV2Pools = require('../../../data/fantom/equalizerV2LpPools.json');
const ichiPools = require('../../../data/fantom/equalizerIchiPools.json');
import { addressBook } from '../../../../packages/address-book/src/address-book';
const {
  fantom: {
    tokens: { EQUAL },
  },
} = addressBook;

const pools = [...volatileV2Pools, ...ichiPools];
const getEqualizerApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'ftmEQUAL',
    oracle: 'tokens',
    decimals: getEDecimals(EQUAL.decimals),
    reward: EQUAL.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEqualizerApys error', result.reason);
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

module.exports = getEqualizerApys;
