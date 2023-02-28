const { cantoWeb3: web3 } = require('../../../utils/web3');
const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/canto/velocimeterStableLpPools.json');
const volatilePools = require('../../../data/canto/velocimeterLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  canto: {
    tokens: { FLOW },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getVelocimeterApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'FLOW',
    oracle: 'tokens',
    decimals: getEDecimals(FLOW.decimals),
    reward: FLOW.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
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
