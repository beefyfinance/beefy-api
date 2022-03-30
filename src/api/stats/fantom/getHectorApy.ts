const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fantom: {
    tokens: { WFTM },
  },
} = addressBook;

const singlePool = [
  {
    name: 'curve-ftm-tor',
    address: '0x24699312CB27C26Cfc669459D670559E5E44EE60',
    rewardPool: '0x61B71689684800f73eBb67378fc2e1527fbDC3b3',
    chainId,
  },
];

const getHectorApy = async () => {
  const TORApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'WFTM',
    oracle: 'tokens',
    decimals: getEDecimals(WFTM.decimals),
    web3: web3,
    chainId,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([TORApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getHectorApys error', result.reason);
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

module.exports = getHectorApy;
