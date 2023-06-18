const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/optimism/velodromeStableLpPools.json');
const volatilePools = require('../../../data/optimism/velodromeLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  optimism: {
    tokens: { VELO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: getEDecimals(VELO.decimals),
    reward: VELO.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getVelodromeApys error', result.reason);
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

module.exports = getVelodromeApys;
