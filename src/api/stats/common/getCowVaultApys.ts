import type { GetContractReturnType } from 'viem/_types/actions/getContract';
import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from './getApyBreakdown';
import { BIG_ZERO, fromWei, toBigNumber } from '../../../utils/big-number';
import {
  addressBookByChainId,
  ChainId,
  TokenWithId,
} from '../../../../packages/address-book/src/address-book';
import { ApiChain, toChainId } from '../../../utils/chain';
import { getCowVaultsMeta } from '../../cowcentrated/getCowVaultsMeta';
import {
  type AnyCowClmMeta,
  type CowClmMeta,
  type CowClmWithRewardPoolMeta,
  type CowRewardPool,
  type CowRewardPoolReward,
  isCowClmWithRewardPoolMeta,
} from '../../cowcentrated/types';
import { fetchContract } from '../../rpc/client';
import { IBeefyRewardPool } from '../../../abis/IBeefyRewardPool';
import { ZERO_ADDRESS } from '../../../utils/address';
import { isDefined, isNonEmptyArray, type NonEmptyArray } from '../../../utils/array';
import type { Address, Client } from 'viem';
import { getAmmPrice } from '../getAmmPrices';
import { isFiniteNumber } from '../../../utils/number';
import { getUnixTime } from 'date-fns';
import { SECONDS_PER_YEAR } from '../../../utils/time';
import { ApyBreakdownFromInput, getApyBreakdownFrom } from './getApyBreakdownFrom';

/**
 * Based CLMs + Reward Pools
 */
export const getCowApys = async (apiChain: ApiChain) => {
  const clms = getCowVaultsMeta(apiChain);
  if (!clms.length) {
    throw new Error(`No clms found for ${apiChain}`);
  }

  const chainId = toChainId(apiChain);
  const [clmBreakdownsResult, rewardPoolAprsResult] = await Promise.allSettled([
    getCowClmApyBreakdown(chainId, clms),
    getCowRewardPoolAprs(chainId, clms),
  ]);

  if (clmBreakdownsResult.status === 'rejected') {
    throw new Error(
      `Failed to get clm apy breakdowns for ${apiChain}: ${clmBreakdownsResult.reason}`
    );
  }

  const clmBreakdowns = clmBreakdownsResult.value;
  if (rewardPoolAprsResult.status === 'rejected') {
    console.error(
      `Failed to get clm reward pool aprs for ${apiChain}: ${rewardPoolAprsResult.reason}`
    );
    // keep clm data even if reward pool data is missing
    return clmBreakdowns;
  }

  const rewardPoolAprs = rewardPoolAprsResult.value;
  const rewardPoolBreakdowns = getCowRewardPoolApyBreakdown(clms, clmBreakdowns, rewardPoolAprs);

  if (!rewardPoolBreakdowns) {
    // this just means none of the CLMs had reward pools defined in config
    return clmBreakdowns;
  }

  return {
    apys: { ...clmBreakdowns.apys, ...rewardPoolBreakdowns.apys },
    apyBreakdowns: { ...clmBreakdowns.apyBreakdowns, ...rewardPoolBreakdowns.apyBreakdowns },
  };
};

function getCowRewardPoolApyBreakdown(
  clms: AnyCowClmMeta[],
  clmApys: ApyBreakdownResult,
  rewardPoolAprs: (number | undefined)[]
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm, index): ApyBreakdownFromInput | undefined => {
      if (isCowClmWithRewardPoolMeta(clm)) {
        return {
          oracleId: clm.rewardPool.oracleId,
          address: clm.rewardPool.address,
          beefyFee: 0,
          farmApr: rewardPoolAprs[index],
          clmApr: clmApys.apyBreakdowns[clm.oracleId]?.clmApr,
          merklApr: clmApys.apyBreakdowns[clm.oracleId]?.merklApr,
        };
      }
      return undefined;
    })
    .filter(isDefined);

  return inputs.length ? getApyBreakdownFrom(inputs) : undefined;
}

const getCowRewardPoolAprs = async (
  chainId: ChainId,
  clms: AnyCowClmMeta[]
): Promise<(number | undefined)[]> => {
  const resolveUndefined = Promise.resolve(undefined);
  return Promise.all(
    clms.map(clm =>
      isCowClmWithRewardPoolMeta(clm) ? getCowRewardPoolApr(chainId, clm) : resolveUndefined
    )
  );
};

const getCowRewardPoolRewards = async (
  rewardPool: CowRewardPool,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>,
  tokenAddressMap: Record<string, TokenWithId>
): Promise<NonEmptyArray<CowRewardPoolReward> | undefined> => {
  if (rewardPool.rewards) {
    return rewardPool.rewards;
  }

  const earned = await rewardPoolContract.read.earned([ZERO_ADDRESS] as const);
  if (typeof earned === 'bigint') {
    throw new Error(
      `${rewardPool.oracleId}: earned(address) returned uint256, expected (address[],uint256[])`
    );
  }

  const [rewardAddresses] = earned;
  if (rewardAddresses.length === 0) {
    console.warn(`${rewardPool.oracleId}: no rewards found via contract`);
    return undefined;
  }

  const maybeRewards = rewardAddresses
    .map((address, index) => {
      const token = tokenAddressMap[address] || undefined;
      return token
        ? { id: index, oracleId: token.oracleId || token.id, decimals: token.decimals }
        : undefined;
    })
    .filter(isDefined);

  if (!isNonEmptyArray(maybeRewards)) {
    console.warn(`${rewardPool.oracleId}: no rewards found via contract are in the address book`);
    return undefined;
  }

  if (maybeRewards.length < rewardAddresses.length) {
    console.warn(
      `${rewardPool.oracleId}: some rewards found via contract are not in the address book`,
      rewardAddresses
    );
  }

  return maybeRewards;
};

type CowRewardPoolRewardWithPrice = CowRewardPoolReward & { price: number };

const getCowRewardPoolRewardsWithPrices = async (
  rewardPool: CowRewardPool,
  rewards: NonEmptyArray<CowRewardPoolReward>
): Promise<NonEmptyArray<CowRewardPoolRewardWithPrice> | undefined> => {
  const prices = await Promise.allSettled(rewards.map(reward => getAmmPrice(reward.oracleId)));
  const rewardsWithPrices = rewards
    .map((reward, index) => {
      const price = prices[index];
      if (price.status === 'rejected') {
        console.warn(
          `${rewardPool.oracleId}: failed to get price for reward ${reward.oracleId}`,
          price.reason
        );
        return undefined;
      }
      if (!isFiniteNumber(price.value)) {
        console.warn(
          `${rewardPool.oracleId}: price for reward ${reward.oracleId} is not a finite number`
        );
        return undefined;
      }

      return { ...reward, price: price.value };
    })
    .filter(isDefined);

  if (!isNonEmptyArray(rewardsWithPrices)) {
    console.warn(`${rewardPool.oracleId}: no rewards have prices`);
    return undefined;
  }

  return rewardsWithPrices;
};

type CowRewardPoolRewardInfo = {
  address: Address;
  periodFinish: bigint;
  duration: bigint;
  lastUpdateTime: bigint;
  rewardRate: bigint;
};
type CowRewardPoolRewardWithInfo = CowRewardPoolRewardWithPrice & CowRewardPoolRewardInfo;

const getCowRewardPoolRewardsWithInfo = async (
  rewardPool: CowRewardPool,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>,
  tokenAddressMap: Record<string, TokenWithId>
): Promise<NonEmptyArray<CowRewardPoolRewardWithInfo> | undefined> => {
  const rewards = await getCowRewardPoolRewards(rewardPool, rewardPoolContract, tokenAddressMap);
  if (!rewards) {
    return undefined;
  }
  const rewardsWithPrices = await getCowRewardPoolRewardsWithPrices(rewardPool, rewards);
  if (!rewardsWithPrices) {
    return undefined;
  }
  const rewardsInfo = await Promise.allSettled(
    rewardsWithPrices.map(reward => rewardPoolContract.read.rewardInfo([BigInt(reward.id)]))
  );
  const now = getUnixTime(new Date());
  const rewardsWithInfo = rewardsWithPrices.map((reward, index) => {
    const info = rewardsInfo[index];
    if (info.status === 'rejected') {
      console.warn(
        `${rewardPool.oracleId}: failed to get reward info for reward ${reward.oracleId} at ${reward.id}`,
        info.reason
      );
      return undefined;
    }

    const [address, periodFinish, duration, lastUpdateTime, rewardRate] = info.value;
    if (periodFinish < now) {
      return undefined;
    }

    return {
      ...reward,
      address,
      periodFinish,
      duration,
      lastUpdateTime,
      rewardRate,
    };
  });

  if (!isNonEmptyArray(rewardsWithInfo)) {
    console.warn(`${rewardPool.oracleId}: no rewards have reward info`);
    return undefined;
  }

  return rewardsWithInfo;
};

const getCowRewardPoolYearlyRewardsInUsd = async (
  rewardPool: CowRewardPool,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>,
  tokenAddressMap: Record<string, TokenWithId>
): Promise<BigNumber | undefined> => {
  const rewards = await getCowRewardPoolRewardsWithInfo(
    rewardPool,
    rewardPoolContract,
    tokenAddressMap
  );
  if (!rewards) {
    return undefined;
  }

  return rewards.reduce(
    (sum, { rewardRate, price, decimals }) =>
      sum.plus(fromWei(toBigNumber(rewardRate), decimals).times(price).times(SECONDS_PER_YEAR)),
    BIG_ZERO
  );
};

const getCowRewardPoolTotalStakedInUsd = async (
  clm: CowClmWithRewardPoolMeta,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>
): Promise<BigNumber | undefined> => {
  const [price, totalSupply] = await Promise.all([
    getAmmPrice(clm.oracleId),
    // assumption: rcowX is 1:1 with cowX
    rewardPoolContract.read.totalSupply(),
  ]);
  if (!isFiniteNumber(price)) {
    console.warn(
      `${clm.rewardPool.oracleId}: failed to get price for underlying ${clm.oracleId}`,
      price
    );
    return undefined;
  }
  // assumption: underlying is cowX with 18 decimals
  return fromWei(toBigNumber(totalSupply), 18).times(price);
};

const getCowRewardPoolApr = async (
  chainId: ChainId,
  clm: CowClmWithRewardPoolMeta
): Promise<number | undefined> => {
  try {
    const rewardPoolContract = fetchContract(clm.rewardPool.address, IBeefyRewardPool, chainId);
    const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
      getCowRewardPoolYearlyRewardsInUsd(
        clm.rewardPool,
        rewardPoolContract,
        addressBookByChainId[chainId].tokenAddressMap
      ),
      getCowRewardPoolTotalStakedInUsd(clm, rewardPoolContract),
    ]);
    if (!yearlyRewardsInUsd || !totalStakedInUsd || totalStakedInUsd.isZero()) {
      return undefined;
    }
    return yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();
  } catch (err) {
    console.error(`> getCowRewardPoolApr Error for ${clm.rewardPool.oracleId}: ${err.message}`);
    return undefined;
  }
};

const getCowClmApyBreakdown = async (
  chainId: ChainId,
  vaults: AnyCowClmMeta[]
): Promise<ApyBreakdownResult> => {
  const merklCampaigns = await getMerklCampaigns(chainId);
  const pools = [];
  const farmAprs: BigNumber[] = [];
  const clmAprs: number[] = [];
  const merklAprs: number[] = [];
  vaults.forEach(vault => {
    pools.push({ name: vault.oracleId });
    farmAprs.push(BIG_ZERO);
    clmAprs.push(new BigNumber(vault.apr).toNumber());
    merklAprs.push(getMerklAprForVault(vault, merklCampaigns));
  });
  return getApyBreakdown(
    pools,
    undefined,
    farmAprs,
    undefined,
    undefined,
    undefined,
    clmAprs,
    merklAprs
  );
};

type Forwarder = {
  almAPR: number;
  almAddress: string;
};

type Campaign = {
  mainParameter: string;
  forwarders: Forwarder[];
};

type MerklChainCampaigns = {
  [poolIdentifier: string]: {
    [campaignID: string]: Campaign;
  };
};

type MerklAPIChainCampaigns = {
  [chainId in ChainId]: MerklAPIChainCampaigns;
};

const getMerklCampaigns = async (chainID: ChainId) => {
  try {
    const response = await fetch('https://api.merkl.xyz/v3/campaigns?chainIds=' + chainID).then(
      res => res.json() as Promise<MerklAPIChainCampaigns>
    );
    return response[chainID];
  } catch (err) {
    console.error(`> getMerklCampaigns Error on ${chainID}  ${err.message}`);
    console.error(err);
    return {};
  }
};

const getMerklAprForVault = (vault: CowClmMeta, merklCampaigns: MerklChainCampaigns) => {
  if (!merklCampaigns) return 0;
  let apr = 0;
  for (const [poolId, campaigns] of Object.entries(merklCampaigns)) {
    for (const [campaignId, campaign] of Object.entries(campaigns)) {
      if (campaign.mainParameter.toLowerCase() === vault.lpAddress.toLowerCase()) {
        campaign.forwarders.forEach(forwarder => {
          if (forwarder.almAddress.toLowerCase() === vault.address.toLowerCase()) {
            if (forwarder.almAPR === 0 || isNaN(forwarder.almAPR)) return;
            apr += forwarder.almAPR / 100;
          }
        });
      }
    }
  }
  return apr;
};
