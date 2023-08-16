import BigNumber from 'bignumber.js';
import { BASE_CHAIN_ID as chainId } from '../../../constants';
import getApyBreakdown, { ApyBreakdownResult } from '../common/getApyBreakdown';
import fetchPrice from '../../../utils/fetchPrice';
import { fetchContract } from '../../rpc/client';
import BaseSwapMasterChefAbi from '../../../abis/base/BaseSwapMasterChefAbi';
import pools from '../../../data/base/baseSwapLpPools.json';

const masterchef = '0x2B0A43DCcBD7d42c18F6A83F86D1a19fA58d541A';
const oracleId = 'BSWAP';

const getBaseSwapApys = async (): Promise<ApyBreakdownResult> => {
  const farmApys = await getFarmApys();
  return getApyBreakdown(pools, {}, farmApys, 0.003);
};

const getFarmApys = async (): Promise<BigNumber[]> => {
  const apys: BigNumber[] = [];

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: oracleId });

  const [{ blockRewards, totalAllocPoint }, { balances, allocPoints }] = await Promise.all([
    getMasterChefData(),
    getPoolsData(),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const oracle = 'lps';
    const id = pool.name;
    const stakedPrice = await fetchPrice({ oracle, id });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(pool.decimals ?? '1e18');

    const poolBlockRewards = blockRewards.times(allocPoints[i]).dividedBy(totalAllocPoint);

    const secondsPerYear = 31536000;
    const yearlyRewards = poolBlockRewards.times(secondsPerYear);
    let yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy('1e18');

    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BaseSwapMasterChefAbi, chainId);
  const blockRewards = new BigNumber((await masterchefContract.read.bswapPerSec()).toString());
  const totalAllocPoint = new BigNumber(
    (await masterchefContract.read.totalAllocPoint()).toString()
  );
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async () => {
  const masterchefContract = fetchContract(masterchef, BaseSwapMasterChefAbi, chainId);
  const poolCalls = [];
  pools.forEach(pool => {
    poolCalls.push(masterchefContract.read.poolInfo([BigInt(pool.poolId)]));
  });

  const [poolResults] = await Promise.all([Promise.all(poolCalls)]);

  // fetches balances from totalDeposit on the poolInfo
  const balances: BigNumber[] = poolResults.map(v => new BigNumber(v['4'].toString()));
  const allocPoints: BigNumber[] = poolResults.map(v => new BigNumber(v['1'].toString()));
  return { balances, allocPoints };
};

module.exports = getBaseSwapApys;
