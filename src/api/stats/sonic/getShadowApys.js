const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

//const stablePools = require('../../../data/sonic/shadowStableLpPools.json');
const volatilePools = require('../../../data/sonic/shadowLpPools.json');

const pools = [/*...stablePools, */ ...volatilePools].filter(pool => pool.gauge !== undefined);
const getShadowApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'xSHADOW',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x5050bc082FF4A74Fb6B0B04385dEfdDB114b2424',
    ramses: true,
    rewardScale: '1e18',
    //log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getShadowSonicApys error', result.reason);
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

module.exports = getShadowApys;
