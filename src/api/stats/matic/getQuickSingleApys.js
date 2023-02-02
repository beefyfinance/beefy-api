import { getRewardPoolApys } from '../common/getRewardPoolApys';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getEDecimals } from '../../../utils/getEDecimals';
const { polygonWeb3 } = require('../../../utils/web3');
const {
  polygon: {
    tokens: { QUICK, newQUICK },
  },
} = addressBook;

export const getQuickSingleApys = async () => {
  const oldQuickApy = getRewardPoolApys({
    pools: [
      {
        name: 'quick-quick',
        address: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
        rewardPool: '0xF3ed4Fc825864a16CAb4b8946622222050c63f5E',
        oracle: 'tokens',
        oracleId: 'QUICK',
        decimals: '1e18',
      },
    ],
    oracleId: 'IXT',
    oracle: 'tokens',
    tokenAddress: QUICK.address,
    decimals: getEDecimals(QUICK.decimals),
    web3: polygonWeb3,
    chainId: 137,
    // log: true,
  });

  const newQuickApy = getRewardPoolApys({
    pools: [
      {
        name: 'quick-newquick',
        address: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
        rewardPool: '0x35ac26c20205f4D717325780C7666E2AB66DdC74',
        oracle: 'tokens',
        oracleId: 'newQUICK',
        decimals: '1e18',
      },
    ],
    oracleId: 'TEL',
    oracle: 'tokens',
    decimals: '1e20',
    web3: polygonWeb3,
    chainId: 137,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([oldQuickApy, newQuickApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getQuickApys error', result.reason);
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
