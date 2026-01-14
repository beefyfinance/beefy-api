import { getRewardPoolApys } from '../common/getRewardPoolApys';

const pools = [
  {
    name: 'sky-usds',
    rewardPool: '0x0650CAF159C5A49f711e8169D4336ECB9b950275',
    stakingToken: 'USDS',
    reward: 'SKY',
  },
  {
    name: 'sky-usds-spk',
    rewardPool: '0x173e314C7635B45322cd8Cb14f44b312e079F3af',
    stakingToken: 'USDS',
    reward: 'SPK',
  },
  {
    name: 'sky-sky',
    rewardPool: '0x38E4254bD82ED5Ee97CD1C4278FAae748d998865',
    stakingToken: 'SKY',
    reward: 'USDS',
  },
  {
    name: 'sky-sky-spk',
    rewardPool: '0x99cBC0e4E6427F6939536eD24d1275B95ff77404',
    stakingToken: 'SKY',
    reward: 'SPK',
  },
];

export const getSkyApy = async () => {
  const res = await Promise.all(
    pools.map(p =>
      getRewardPoolApys({
        pools: [
          {
            name: p.name,
            address: p.rewardPool,
            rewardPool: p.rewardPool,
            decimals: '1e18',
            oracleId: p.stakingToken,
            oracle: 'tokens',
          },
        ],
        oracleId: p.reward,
        oracle: 'tokens',
        decimals: '1e18',
        chainId: 1,
        // log: true,
      })
    )
  );

  const apys = Object.fromEntries(res.map(r => [Object.keys(r.apys)[0], Object.values(r.apys)[0]]));
  const apyBreakdowns = Object.fromEntries(
    res.map(r => [Object.keys(r.apyBreakdowns)[0], Object.values(r.apyBreakdowns)[0]])
  );

  return { apys, apyBreakdowns };
};
