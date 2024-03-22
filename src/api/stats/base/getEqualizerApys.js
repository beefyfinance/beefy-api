const { BASE_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/base/equalizerStableLpPools.json');
const volatilePools = require('../../../data/base/equalizerLpPools.json');
const ichiPools = require('../../../data/base/equalizerIchiPools.json');

const pools = [...stablePools, ...volatilePools, ...ichiPools];
const getEqualizerApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'SCALE',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x54016a4848a38f257B6E96331F7404073Fd9c32C',
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEqualizerBaseApys error', result.reason);
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
