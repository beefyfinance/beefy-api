const { FANTOM_CHAIN_ID } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fantom: {
    tokens: { WFTM, beFTM },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-beFTM',
    address: '0x7381eD41F6dE418DdE5e84B55590422a57917886',
    rewardPool: '0xE00D25938671525C2542A689e42D1cfA56De5888',
    decimals: '1e18',
    oracleId: 'beFTM',
    oracle: 'tokens',
    chainId: 250,
  },
];

const getbeFTMApy = async () => {
  const beFTMApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'WFTM',
    oracle: 'tokens',
    decimals: getEDecimals(WFTM.decimals),
    chainId: FANTOM_CHAIN_ID,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beFTMApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getbeFTMApys error', result.reason);
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

module.exports = getbeFTMApy;
