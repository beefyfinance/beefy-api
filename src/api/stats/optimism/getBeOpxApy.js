import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  optimism: {
    tokens: { WETH, beOPX },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-beopx',
    address: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
    rewardPool: '0x96f990d1aAF83B09a4BA3D22cAab0377a058C84f',
    decimals: '1e18',
    oracleId: 'beOPX',
    oracle: 'tokens',
    chainId: 10,
  },
];

const getBeOpxApy = async () => {
  const beOpxApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'WETH',
    oracle: 'tokens',
    decimals: getEDecimals(WETH.decimals),
    chainId: 10,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beOpxApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getBeOpxApys error', result.reason);
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

module.exports = getBeOpxApy;
