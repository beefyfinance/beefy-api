import { getRewardPoolApys } from '../common/getRewardPoolApys';

export const getSkyApy = async () => {
  const [usds, sky] = await Promise.all([
    getRewardPoolApys({
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
    }),
    getRewardPoolApys({
      pools: [
        {
          name: 'sky-sky',
          address: '0xf9a9cfd3229e985b91f99bc866d42938044ffa1c',
          rewardPool: '0x38E4254bD82ED5Ee97CD1C4278FAae748d998865',
          decimals: '1e18',
          oracleId: 'SKY',
          oracle: 'tokens',
          chainId: 1,
        },
      ],
      oracleId: 'USDS',
      oracle: 'tokens',
      decimals: '1e18',
      chainId: 1,
      // log: true,
    }),
  ]);

  const apys = { ...usds.apys, ...sky.apys };
  const apyBreakdowns = { ...usds.apyBreakdowns, ...sky.apyBreakdowns };

  return { apys, apyBreakdowns };
};
