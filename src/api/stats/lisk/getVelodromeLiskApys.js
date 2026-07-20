const { LISK_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const { getLoggerFor } = require('../../../utils/logger/index.js');

const logger = getLoggerFor({ module: 'apy', platform: 'velodrome', chain: chainId });

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
      logger.warn({ err: result.reason }, 'apy sub-calculation failed');
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
