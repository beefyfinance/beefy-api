import { getEDecimals } from '../../../utils/getEDecimals';
import { getRewardPoolApys } from '../common/getRewardPoolApys';
import { addressBook } from '../../../../packages/address-book/address-book';

const {
  fantom: {
    tokens: { binSPIRIT },
  },
} = addressBook;

const singlePool = [
  {
    name: 'beefy-binspirit',
    address: '0x44e314190D9E4cE6d4C0903459204F8E21ff940A',
    rewardPool: '0xFAE44b30F6F9BbD44E6B7687471dd73D71FaBDC6',
    decimals: '1e18',
    oracleId: 'binSPIRIT',
    oracle: 'tokens',
    chainId: 250,
  },
];

const getSpiritApys = async () => {
  const binSpiritApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: binSPIRIT.oracleId,
    oracle: 'tokens',
    decimals: getEDecimals(binSPIRIT.decimals),
    chainId: 250,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([binSpiritApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSpiritApys error', result.reason);
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

module.exports = getSpiritApys;
