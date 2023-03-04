const { kavaWeb3: web3 } = require('../../../utils/web3');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/kava/equilibreStableLpPools.json');
const volatilePools = require('../../../data/kava/equilibreLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  kava: {
    tokens: { VARA },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getEquilibreApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'VARA',
    oracle: 'tokens',
    decimals: getEDecimals(VARA.decimals),
    reward: VARA.address,
    boosted: false,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getEquilibreApys error', result.reason);
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

module.exports = getEquilibreApys;
