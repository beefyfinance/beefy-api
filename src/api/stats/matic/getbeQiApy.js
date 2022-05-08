const { polygonWeb3: web3 } = require('../../../utils/web3');
const { POLYGON_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  polygon: {
    tokens: { QI, beQI },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-beqi',
    address: beQI.address,
    rewardPool: '0x5D060698F179E7D2233480A44d6D3979e4Ae9e7f',
    decimals: getEDecimals(beQI.decimals),
    oracleId: 'QI',
    oracle: 'tokens',
    chainId: 137,
  },
];

const getbeQiApy = async () => {
  const beQiApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'QI',
    oracle: 'tokens',
    decimals: getEDecimals(QI.decimals),
    web3: web3,
    chainId: chainId,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beQiApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getbeQiApys error', result.reason);
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

module.exports = getbeQiApy;
