import { getRewardPoolApys } from '../common/getRewardPoolApys.ts';

const pools = [
  {
    name: 'sky-staking',
    rewardPool: '0xB44C2Fb4181D7Cb06bdFf34A46FdFe4a259B40Fc',
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
    rewardPool: '0x4E41488C19cD35EB4de3083Fc3e204854c75c86a',
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
