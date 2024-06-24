const { MODE_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/mode/velodromeModeStablePools.json');
const volatilePools = require('../../../data/mode/velodromeModePools.json');
import { addressBook } from '../../../../packages/address-book/src/address-book';

const {
  mode: {
    tokens: { MODE },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelodromeModeApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    chainId: chainId,
    pools: pools,
    oracleId: 'MODE',
    oracle: 'tokens',
    decimals: getEDecimals(MODE.decimals),
    reward: MODE.address,
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

module.exports = getVelodromeModeApys;
