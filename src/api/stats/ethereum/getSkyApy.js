import { getRewardPoolApys } from '../common/getRewardPoolApys';

const pools = [
  {
    name: 'sky-staking',
    rewardPool: '0xb44c2fb4181d7cb06bdff34a46fdfe4a259b40fc',
    stakingToken: 'SKY',
    reward: 'SKY',
  },
  {
    name: 'sky-usds-spk',
    rewardPool: '0x173e314C7635B45322cd8Cb14f44b312e079F3af',
    stakingToken: 'USDS',
    reward: 'SPK',
  },
  {
    name: 'sky-usds-grove',
    rewardPool: '0x4e41488c19cd35eb4de3083fc3e204854c75c86a',
    stakingToken: 'USDS',
    reward: 'GROVE',
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
