const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

import { addressBook } from '../../../../packages/address-book/address-book';
const {
  optimism: {
    tokens: { VELO, beVELO },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-bevelo',
    address: beVELO.address,
    rewardPool: '0x7680639E51155a2C7C9cC98872f0c12A15990241',
    decimals: getEDecimals(beVELO.decimals),
    oracleId: 'VELO',
    oracle: 'tokens',
    chainId: 10,
  },
];

const getbeVeloApy = async () => {
  const beVeloApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: 'VELO',
    oracle: 'tokens',
    decimals: getEDecimals(VELO.decimals),
    web3: web3,
    chainId: chainId,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([beVeloApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getbeVeloApys error', result.reason);
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

module.exports = getbeVeloApy;
