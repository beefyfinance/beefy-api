const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  avax: {
    tokens: { JOE, beJOE },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-beJoe',
    address: beJOE.address,
    rewardPool: '0x2E360492120cebeB2527c41BAE1a4f21992D86Ec',
    decimals: getEDecimals(beJOE.decimals),
    oracleId: 'JOE',
    oracle: 'tokens',
    chainId: 250,
  },
];

const getbeJOEApy = async () => {
  const beJOEApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'JOE',
    oracle: 'tokens',
    decimals: getEDecimals(JOE.decimals),
    web3: web3,
    chainId: chainId,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beJOEApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getbeJOEApys error', result.reason);
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

module.exports = getbeJOEApy;
