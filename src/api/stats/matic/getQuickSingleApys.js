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
        rewardPool: '0xA518cca4891e274DD85bDCc47ce8191bccA19854',
        oracle: 'tokens',
        oracleId: 'QUICK',
        decimals: '1e18',
      }
    ],
    oracleId: 'COT',
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
        rewardPool: '0xEc9DB6f357917a88e223c6A88c2CBFC6f7d76a39',
        oracle: 'tokens',
        oracleId: 'newQUICK',
        decimals: '1e18',
      }
    ],
    oracleId: 'QUIDD',
    oracle: 'tokens',
    tokenAddress: newQUICK.address,
    decimals: getEDecimals(newQUICK.decimals),
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
