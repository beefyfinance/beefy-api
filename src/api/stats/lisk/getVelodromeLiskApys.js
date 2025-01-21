const { LISK_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/lisk/velodromeLiskStablePools.json');
const volatilePools = require('../../../data/lisk/velodromeLiskPools.json');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  lisk: {
    tokens: { XVELO },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeLiskApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'XVELO',
    oracle: 'tokens',
    decimals: getEDecimals(XVELO.decimals),
    reward: XVELO.address,
    boosted: false,
    singleReward: true,
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

module.exports = getVelodromeLiskApys;
