const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const oldStablePools = require('../../../data/optimism/oldVelodromeStableLpPools.json');
const oldVolatilePools = require('../../../data/optimism/oldVelodromeLpPools.json');
const stablePools = require('../../../data/optimism/velodromeStableLpPools.json');
const volatilePools = require('../../../data/optimism/velodromeLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  optimism: {
    tokens: { VELO, VELOV2 },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const oldPools = [...oldStablePools, ...oldVolatilePools];
const getVelodromeApys = async () => {
  const oldGaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: oldPools,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: getEDecimals(VELO.decimals),
    reward: VELO.address,
    boosted: false,
    // log: true,
  });

  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'VELOV2',
    oracle: 'tokens',
    decimals: getEDecimals(VELOV2.decimals),
    reward: VELOV2.address,
    boosted: false,
    singleReward: true,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([oldGaugeApys, gaugeApys]);
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
