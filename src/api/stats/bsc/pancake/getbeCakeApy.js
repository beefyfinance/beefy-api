const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
import { getEDecimals } from '../../../../utils/getEDecimals';
import { getRewardPoolApys } from '../../common/getRewardPoolApys';

import { addressBook } from '../../../../../packages/address-book/address-book';
const {
  bsc: {
    tokens: { CAKE, beCAKE },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-becake',
    address: beCAKE.address,
    rewardPool: '0x49fAfAA2d9E32A6Af37A11cEeC50D76A772390Cc',
    decimals: getEDecimals(beCAKE.decimals),
    oracleId: 'Cake',
    oracle: 'tokens',
    chainId: chainId,
  },
];

const getbeCakeApy = async () => {
  const beCakeApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'Cake',
    oracle: 'tokens',
    decimals: getEDecimals(CAKE.decimals),
    web3: web3,
    chainId: chainId,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beCakeApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getbeCakeApys error', result.reason);
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

module.exports = getbeCakeApy;
