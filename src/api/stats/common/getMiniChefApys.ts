import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { ChainId } from '../../../../packages/address-book/types/chainid';

import fetchPrice from '../../../utils/fetchPrice';
import { getApyBreakdown } from './getApyBreakdown';
import { LpPool } from '../../../types/LpPool';

// trading apr
import { SUSHI_LPF } from '../../../constants';
import { getTradingFeeAprSushi as getTradingFeeApr } from '../../../utils/getTradingFeeApr';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

// abis
import SushiMiniChefV2 from '../../../abis/matic/SushiMiniChefV2.json';
import SushiComplexRewarderTime from '../../../abis/matic/SushiComplexRewarderTime.json';
import ERC20 from '../../../abis/ERC20.json';

const oracle = 'tokens';
const DECIMALS = '1e18';
const secondsPerBlock = 1;
const secondsPerYear = 31536000;

interface MiniChefApyParams {
  minichefConfig: {
    minichef: string; // address
    outputOracleId: string; // i.e. SUSHI
    tokenPerSecondContractMethodName: `${string}PerSecond`;
  };
  rewarderConfig: {
    rewarder: string; // address
    rewarderTokenOracleId: string; // i.e. WMATIC
    // totalAllocPoint is non public
    // https://github.com/sushiswap/sushiswap/blob/37026f3749f9dcdae89891f168d63667845576a7/contracts/mocks/ComplexRewarderTime.sol#L44
    // need to pass in same hardcoded value found here:
    // https://github.com/sushiswap/sushiswap-interface/blob/6300093e17756038a5b5089282d7bbe6dce87759/src/hooks/minichefv2/useFarms.ts#L77
    rewarderTotalAllocPoint: number;
  };
  pools: LpPool[];
  tradingClient: ApolloClient<NormalizedCacheObject>;
  web3: Web3;
  chainId: ChainId;
}

export const getMiniChefApys = async (params: MiniChefApyParams) => {
  const { pools, tradingClient } = params;
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = tradingClient
    ? await getTradingFeeApr(tradingClient, pairAddresses, SUSHI_LPF)
    : {};
  const farmApys = await getFarmApys(params);

  return getApyBreakdown(pools, tradingAprs, farmApys, SUSHI_LPF);
};

const getFarmApys = async (params: MiniChefApyParams) => {
  const { web3, pools, minichefConfig, rewarderConfig } = params;
  const apys = [];
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2 as any, minichefConfig.minichef);
  const sushiPerSecond = new BigNumber(
    await minichefContract.methods[minichefConfig.tokenPerSecondContractMethodName]().call()
  );
  const totalAllocPoint = new BigNumber(await minichefContract.methods.totalAllocPoint().call());

  const rewardContract = new web3.eth.Contract(
    SushiComplexRewarderTime as any,
    rewarderConfig.rewarder
  );
  const rewardPerSecond = new BigNumber(await rewardContract.methods.rewardPerSecond().call());

  const tokenPrice = await fetchPrice({ oracle, id: minichefConfig.outputOracleId });
  const nativePrice = await fetchPrice({ oracle, id: rewarderConfig.rewarderTokenOracleId });
  const { balances, allocPoints, rewardAllocPoints } = await getPoolsData(params);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = sushiPerSecond.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

    const allocPoint = rewardAllocPoints[i];
    const nativeRewards = rewardPerSecond
      .times(allocPoint)
      .dividedBy(rewarderConfig.rewarderTotalAllocPoint);
    const yearlyNativeRewards = nativeRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const nativeRewardsInUsd = yearlyNativeRewards.times(nativePrice).dividedBy(DECIMALS);

    const apy = yearlyRewardsInUsd.plus(nativeRewardsInUsd).dividedBy(totalStakedInUsd);
    apys.push(apy);
  }
  return apys;
};

const getPoolsData = async (params: MiniChefApyParams) => {
  const { web3, pools, minichefConfig, rewarderConfig, chainId } = params;
  const minichefContract = new web3.eth.Contract(SushiMiniChefV2 as any, minichefConfig.minichef);
  const rewardContract = new web3.eth.Contract(
    SushiComplexRewarderTime as any,
    rewarderConfig.rewarder
  );

  const balanceCalls = [];
  const allocPointCalls = [];
  const rewardAllocPointCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20 as any, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(minichefConfig.minichef),
    });
    allocPointCalls.push({
      allocPoint: minichefContract.methods.poolInfo(pool.poolId),
    });
    rewardAllocPointCalls.push({
      allocPoint: rewardContract.methods.poolInfo(pool.poolId),
    });
  });

  const multicall = new MultiCall(web3 as any, multicallAddress(chainId));
  const res = await multicall.all([balanceCalls, allocPointCalls, rewardAllocPointCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint['2']);
  const rewardAllocPoints = res[2].map(v => v.allocPoint['2']);
  return { balances, allocPoints, rewardAllocPoints };
};
