import { MultiCall } from 'eth-multicall';
import { bscWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { BSC_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown from '../common/getApyBreakdown';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import IRewardPool from '../../../abis/IRewardPool.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../../utils/fetchPrice';

const tradingFees = 0.0002;
const secondsPerYear = 31536000;
const womAddress = '0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1';
const wmxAddress = '0xa75d9ca2a0a1D547409D82e1B06618EC284A2CeD';
const boosterAddress = '0xE62c4454d1dd6B727eB7952888B31a74969086B8';

const IWombex = [
  {
    name: 'mintRatio',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
  },
  {
    name: 'tokenRewards',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [
      { name: 'token', type: 'address' },
      { name: 'periodFinish', type: 'uint256' },
      { name: 'rewardRate', type: 'uint256' },
    ],
  },
  ...IRewardPool,
];

const pools = [
  {
    name: 'wombex-busd',
    oracleId: 'BUSD',
    rewardPool: '0x6E85A35fFfE1326e230411f4f3c31c493B05263C',
  },
  {
    name: 'wombex-bnb',
    oracleId: 'BNB',
    rewardPool: '0x98C8f6f029E3A19D796Eb16f9c24703ad884cC83',
    extras: [
      {
        token: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        oracleId: 'BNB',
      },
    ],
  },
  {
    name: 'wombex-bnbx',
    oracleId: 'BNBx',
    rewardPool: '0xC53FBf6Eef001417f0392E667F498B12A17a89F9',
    extras: [
      {
        token: '0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8',
        oracleId: 'SD',
      },
    ],
  },
  {
    name: 'wombex-abnbc',
    oracleId: 'aBNBc',
    rewardPool: '0x3083f5C5fd443d888b938e7805B5eD92900Ee77F',
    extras: [
      {
        token: '0xf307910A4c7bbc79691fD374889b36d8531B08e3',
        oracleId: 'ANKR',
      },
    ],
  },
];

export const getWombexApy = async () => {
  const baseApys = {};
  const farmApys = await getPoolApys(pools);
  const poolsMap = pools.map(p => ({ name: p.name, address: p.name }));
  return getApyBreakdown(poolsMap, baseApys, farmApys, tradingFees);
};

const getPoolApys = async pools => {
  const apys = [];
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const rewardPoolCalls = [];
  const extraRewardCalls = [];
  pools.forEach(pool => {
    const rewardPool = getContract(IWombex, pool.rewardPool);
    rewardPoolCalls.push({
      totalSupply: rewardPool.methods.totalSupply(),
      tokenRewards: rewardPool.methods.tokenRewards(womAddress),
    });
    pool.extras?.forEach(extra => {
      extraRewardCalls.push({
        pool: pool.name,
        token: extra.token,
        tokenRewards: rewardPool.methods.tokenRewards(extra.token),
      });
    });
  });

  const res = await multicall.all([rewardPoolCalls, extraRewardCalls]);
  const poolInfo = res[0].map(v => ({
    totalSupply: new BigNumber(v.totalSupply),
    periodFinish: new BigNumber(v.tokenRewards[1]),
    rewardRate: new BigNumber(v.tokenRewards[2]),
  }));
  const extras = res[1].map(v => ({
    ...v,
    periodFinish: new BigNumber(v.tokenRewards[1]),
    rewardRate: new BigNumber(v.tokenRewards[2]),
  }));

  const wmxPrice = await fetchPrice({ oracle: 'tokens', id: 'WMX' });
  const womPrice = await fetchPrice({ oracle: 'tokens', id: 'WOM' });
  const booster = getContractWithProvider(IWombex, boosterAddress, web3);
  const mintRatio = new BigNumber(await booster.methods.mintRatio().call());
  const wmx = getContractWithProvider(IWombex, wmxAddress, web3);
  const wmxSupply = new BigNumber(await wmx.methods.totalSupply().call());

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const info = poolInfo[i];

    const womRewards = info.rewardRate.times(secondsPerYear);
    const womRewardsInUsd = womRewards.times(womPrice).div('1e18');

    const wmxRewards = getMintedWmxAmount(wmxSupply, womRewards, mintRatio);
    const wmxRewardsInUsd = wmxRewards.times(wmxPrice).div('1e18');

    const stakedPrice = await fetchPrice({ oracle: pool.oracle ?? 'tokens', id: pool.oracleId });
    const totalStakedInUsd = info.totalSupply.times(stakedPrice).div('1e18');
    let yearlyRewardsInUsd = womRewardsInUsd.plus(wmxRewardsInUsd);

    for (const extra of extras.filter(e => e.pool === pool.name)) {
      if (extra.periodFinish < Date.now() / 1000) continue;
      const poolExtra = pool.extras.find(e => e.token === extra.token);
      const price = await fetchPrice({
        oracle: poolExtra.oracle ?? 'tokens',
        id: poolExtra.oracleId,
      });
      const extraRewardsInUsd = extra.rewardRate.times(secondsPerYear).times(price).div('1e18');
      yearlyRewardsInUsd = yearlyRewardsInUsd.plus(extraRewardsInUsd);
      // console.log(pool.name, poolExtra.oracleId, extraRewardsInUsd.div(totalStakedInUsd).valueOf());
    }
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);

    // console.log(pool.name,apy.valueOf(),'wom',womRewardsInUsd.div(totalStakedInUsd).valueOf(),'wmx',wmxRewardsInUsd.div(totalStakedInUsd).valueOf());
  }
  return apys;
};

function getMintedWmxAmount(wmxSupply, womAmount, mintRatio) {
  const initMint = new BigNumber(50000000000000000000000000);
  const totalCliffs = new BigNumber(500);
  const reductionPerCliff = new BigNumber(100000000000000000000000);
  const cliff = wmxSupply.minus(initMint).div(reductionPerCliff).integerValue(BigNumber.ROUND_DOWN);
  let amount = new BigNumber(0);
  if (cliff.lt(totalCliffs)) {
    const reduction = totalCliffs.minus(cliff).times(5).div(2).plus(2);
    amount = womAmount.times(reduction).div(totalCliffs);
  }
  return amount.times(mintRatio).div(10000);
}
