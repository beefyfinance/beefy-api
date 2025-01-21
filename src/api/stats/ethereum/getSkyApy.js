import { getRewardPoolApys } from '../common/getRewardPoolApys';

export const getSkyApy = async () => {
  return getRewardPoolApys({
    pools: [
      {
        name: 'sky-usds',
        address: '0xdC035D45d973E3EC169d2276DDab16f1e407384F',
        rewardPool: '0x0650CAF159C5A49f711e8169D4336ECB9b950275',
        decimals: '1e18',
        oracleId: 'USDS',
        oracle: 'tokens',
        chainId: 1,
      },
    ],
    oracleId: 'SKY',
    oracle: 'tokens',
    decimals: '1e18',
    chainId: 1,
    // log: true,
  });
};
