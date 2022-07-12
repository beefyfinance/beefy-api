const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');

const stablePools = require('../../../data/matic/dystopiaStableLpPools.json');
const volatilePools = require('../../../data/matic/dystopiaLpPools.json');
import { addressBook } from '../../../../packages/address-book/address-book';
import { beefyfinance } from '../../../../packages/address-book/build/address-book/arbitrum/platforms/beefyfinance';
const {
  polygon: {
    platforms: { dystopia, beefyfinance },
    tokens: { DYST },
  },
} = addressBook;

const pools = [...stablePools, ...volatilePools];
const getDystopiaApys = async () => {
  const gaugeApys = getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'DYST',
    oracle: 'tokens',
    decimals: getEDecimals(DYST.decimals),
    reward: DYST.address,
    boosted: true,
    NFTid: 7,
    ve: dystopia.ve,
    gaugeStaker: beefyfinance.gaugeStaker,
    //log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([gaugeApys]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getDystopiaApys error', result.reason);
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

module.exports = getDystopiaApys;
