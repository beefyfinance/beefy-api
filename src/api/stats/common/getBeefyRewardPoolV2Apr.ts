import { Address, type Client, getAddress } from 'viem';
import { isDefined, isNonEmptyArray, NonEmptyArray } from '../../../utils/array';
import type { GetContractReturnType } from 'viem/_types/actions/getContract';
import { IBeefyRewardPool } from '../../../abis/IBeefyRewardPool';
import { TokenWithId } from '../../../../packages/address-book/src/types/token';
import BigNumber from 'bignumber.js';
import { BIG_ONE, BIG_ZERO, fromWei, toBigNumber } from '../../../utils/big-number';
import { SECONDS_PER_YEAR } from '../../../utils/time';
import { getAmmPrice } from '../getAmmPrices';
import { isFiniteNumber } from '../../../utils/number';
import { ChainId } from '../../../../packages/address-book/src/types/chainid';
import { fetchContract } from '../../rpc/client';
import { addressBookByChainId } from '../../../../packages/address-book/src/address-book';
import ERC20Abi from '../../../abis/ERC20Abi';
import { ZERO_ADDRESS } from '../../../utils/address';
import { getUnixTime } from 'date-fns';
import { isResultFulfilled } from '../../../utils/promise';
import { envBoolean } from '../../../utils/env';

const WARN_STAKED_IS_ZERO: boolean = false;
const WARN_STAKED_MISSING_PRICE: boolean = true;
const WARN_REWARDS_NONE_IN_CONTRACT: boolean = false;
const WARN_REWARDS_NONE_IN_ADDRESS_BOOK: boolean = true;
const WARN_REWARDS_SOME_IN_ADDRESS_BOOK: boolean = true;
const WARN_REWARD_INFO_REVERT: boolean = true;
const WARN_REWARDS_ALL_INFO_REVERT: boolean = false;
const WARN_REWARDS_ALL_INACTIVE: boolean = envBoolean('WARN_REWARDS_ALL_INACTIVE', true);
const WARN_REWARD_PRICE_THREW: boolean = true;
const WARN_REWARD_PRICE_MISSING: boolean = true;
const WARN_REWARDS_ALL_MISSING_PRICE: boolean = false;

export type Token = {
  address: Address;
  oracleId: string;
  decimals: number;
};

export type StakedToken = Token & {
  /** needed if standard vault; must be in wei */
  pricePerFullShare?: BigNumber;
};

export type RewardConfig = Token & {
  id: number;
};

type RewardConfigPrice = RewardConfig & {
  price: number;
};

type RewardConfigInfo = RewardConfigPrice & {
  periodFinish: bigint;
  duration: bigint;
  lastUpdateTime: bigint;
  rewardRate: bigint;
};

export type BeefyRewardPoolV2Config = {
  oracleId: string;
  address: Address;
  stakedToken: StakedToken;
  rewards?: NonEmptyArray<RewardConfig> | undefined;
};

type RewardYearlyUsd = RewardConfigInfo & {
  yearlyUsd: BigNumber;
};

export type RewardApr = RewardConfigPrice & {
  apr: number;
};

export type BeefyRewardPoolV2Result = Pick<
  BeefyRewardPoolV2Config,
  'oracleId' | 'address' | 'stakedToken'
> & {
  chainId: ChainId;
  totalApr?: number | undefined;
  rewardsApr?: Array<RewardApr> | undefined;
};

/**
 * gets apr for beefy V2 reward pools with multi token support
 * @param chainId
 * @param pools if you provide rewards array it will use those instead of fetching from contract
 * @returns successful results only
 */
export const getBeefyRewardPoolV2Aprs = async (
  chainId: ChainId,
  pools: BeefyRewardPoolV2Config[]
): Promise<BeefyRewardPoolV2Result[]> => {
  const results = await Promise.allSettled(pools.map(pool => getBeefyRewardPoolV2Apr(chainId, pool)));
  return results
    .filter(isResultFulfilled)
    .map(result => result.value)
    .filter(isDefined);
};

/**
 * gets apr for beefy V2 reward pools with multi token support
 * @param chainId
 * @param pool if you provide rewards array it will use those instead of fetching from contract
 * @returns successful result or undefined
 */
export const getBeefyRewardPoolV2Apr = async (
  chainId: ChainId,
  pool: BeefyRewardPoolV2Config
): Promise<BeefyRewardPoolV2Result | undefined> => {
  try {
    const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
      getYearlyRewardsInUsd(chainId, pool),
      getTotalStakedInUsd(chainId, pool),
    ]);

    const rewardsApr: RewardApr[] = yearlyRewardsInUsd.map(reward => ({
      ...reward,
      apr: totalStakedInUsd.isZero() ? 0 : reward.yearlyUsd.dividedBy(totalStakedInUsd).toNumber(),
    }));
    const totalApr = rewardsApr.reduce((acc, reward) => acc + reward.apr, 0);

    return {
      address: pool.address,
      chainId,
      oracleId: pool.oracleId,
      stakedToken: pool.stakedToken,
      totalApr,
      rewardsApr,
    };
  } catch (err) {
    console.error(`> getBeefyRewardPoolV2Apr error for ${pool.oracleId}: ${err.message}`);
    return undefined;
  }
};

async function getRewardConfigsFromContract(
  pool: BeefyRewardPoolV2Config,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>,
  tokenAddressMap: Record<string, TokenWithId>
): Promise<RewardConfig[]> {
  const earned = await rewardPoolContract.read.earned([ZERO_ADDRESS] as const);
  if (typeof earned === 'bigint') {
    throw new Error(`earned(address) returned uint256, expected (address[],uint256[])`);
  }

  const [rewardAddresses] = earned;
  if (rewardAddresses.length === 0) {
    if (WARN_REWARDS_NONE_IN_CONTRACT) {
      console.warn(`getRewardConfigsFromContract for ${pool.oracleId}: no rewards found via contract`);
    }
    return [];
  }

  const rewardsInAddressBook: RewardConfig[] = rewardAddresses
    .map((address, index) => {
      const token = tokenAddressMap[address] || undefined;
      return token
        ? {
            id: index,
            address: getAddress(token.address),
            oracleId: token.oracleId || token.id,
            decimals: token.decimals,
          }
        : undefined;
    })
    .filter(isDefined);

  if (rewardsInAddressBook.length === 0) {
    if (WARN_REWARDS_NONE_IN_ADDRESS_BOOK) {
      console.warn(
        `getRewardConfigsFromContract for ${pool.oracleId}: no rewards found via contract are in the address book`
      );
    }
    return [];
  }

  if (rewardsInAddressBook.length < rewardAddresses.length) {
    if (WARN_REWARDS_SOME_IN_ADDRESS_BOOK) {
      console.warn(
        `getRewardConfigsFromContract for ${pool.oracleId}: some rewards found via contract are not in the address book`,
        rewardAddresses
      );
    }
  }

  return rewardsInAddressBook;
}

async function getRewardConfigsPrices(
  pool: BeefyRewardPoolV2Config,
  rewards: NonEmptyArray<RewardConfig>
): Promise<RewardConfigPrice[] | undefined> {
  const prices = await Promise.allSettled(rewards.map(reward => getAmmPrice(reward.oracleId)));
  const rewardsWithPrices = rewards
    .map((reward, index) => {
      const price = prices[index];
      if (price.status === 'rejected') {
        if (WARN_REWARD_PRICE_THREW) {
          console.warn(
            `getRewardConfigsPrices for ${pool.oracleId}: failed to get price for reward ${reward.oracleId}`,
            price.reason
          );
        }
        return undefined;
      }
      if (!isFiniteNumber(price.value)) {
        if (WARN_REWARD_PRICE_MISSING) {
          console.warn(
            `getRewardConfigsPrices for ${pool.oracleId}: price for reward ${reward.oracleId} is not a finite number`
          );
        }
        return undefined;
      }

      return { ...reward, price: price.value };
    })
    .filter(isDefined);

  if (rewardsWithPrices.length === 0) {
    if (WARN_REWARDS_ALL_MISSING_PRICE) {
      console.warn(`getRewardConfigsPrices for ${pool.oracleId}: no rewards have prices`);
    }
    return [];
  }

  return rewardsWithPrices;
}

async function getRewardConfigsInfo(
  pool: BeefyRewardPoolV2Config,
  rewards: NonEmptyArray<RewardConfigPrice>,
  rewardPoolContract: GetContractReturnType<typeof IBeefyRewardPool, Client>
): Promise<RewardConfigInfo[]> {
  const rewardsInfo = await Promise.allSettled(
    rewards.map(reward => rewardPoolContract.read.rewardInfo([BigInt(reward.id)]))
  );

  const rewardsWithInfo = rewards
    .map((reward, index) => {
      const info = rewardsInfo[index];
      if (info.status === 'rejected') {
        if (WARN_REWARD_INFO_REVERT) {
          console.warn(
            `getRewardConfigsInfo for ${pool.oracleId}: failed to get reward info for reward ${reward.oracleId} at ${reward.id}`,
            info.reason
          );
        }
        return undefined;
      }

      const [address, periodFinish, duration, lastUpdateTime, rewardRate] = info.value;
      return {
        ...reward,
        address,
        periodFinish,
        duration,
        lastUpdateTime,
        rewardRate,
      };
    })
    .filter(isDefined);

  if (rewardsWithInfo.length === 0) {
    if (WARN_REWARDS_ALL_INFO_REVERT) {
      console.warn(`getRewardConfigsInfo for ${pool.oracleId}: no rewards have reward info`);
    }
    return [];
  }

  const now = getUnixTime(new Date());
  const activeRewards = rewardsWithInfo.filter(reward => reward.periodFinish > now);

  if (activeRewards.length === 0) {
    if (WARN_REWARDS_ALL_INACTIVE) {
      // console.warn(`getRewardConfigsInfo for ${pool.oracleId}: no rewards are active`);
    }
    return [];
  }

  return activeRewards;
}

async function getYearlyRewardsInUsd(
  chainId: ChainId,
  pool: BeefyRewardPoolV2Config
): Promise<RewardYearlyUsd[]> {
  const rewardPoolContract = fetchContract(pool.address, IBeefyRewardPool, chainId);
  const rewardConfigs =
    pool.rewards && pool.rewards.length > 0
      ? pool.rewards
      : await getRewardConfigsFromContract(
          pool,
          rewardPoolContract,
          addressBookByChainId[chainId].tokenAddressMap
        );
  if (!isNonEmptyArray(rewardConfigs)) {
    return [];
  }

  const rewardsWithPrices = await getRewardConfigsPrices(pool, rewardConfigs);
  if (!isNonEmptyArray(rewardsWithPrices)) {
    return [];
  }

  const rewardsWithInfo = await getRewardConfigsInfo(pool, rewardsWithPrices, rewardPoolContract);
  if (!isNonEmptyArray(rewardsWithInfo)) {
    return [];
  }

  return rewardsWithInfo.map(reward => ({
    ...reward,
    yearlyUsd: fromWei(toBigNumber(reward.rewardRate), reward.decimals)
      .times(reward.price)
      .times(SECONDS_PER_YEAR),
  }));
}

async function getTotalStakedInUsd(chainId: ChainId, pool: BeefyRewardPoolV2Config): Promise<BigNumber> {
  const stakedTokenContract = fetchContract(pool.stakedToken.address, ERC20Abi, chainId);

  const [price, totalStaked] = await Promise.all([
    getAmmPrice(pool.stakedToken.oracleId),
    stakedTokenContract.read.balanceOf([pool.address]),
  ]);

  if (totalStaked === 0n) {
    if (WARN_STAKED_IS_ZERO) {
      console.warn(`getTotalStakedInUsd for ${pool.oracleId}: total staked is zero`);
    }
    return BIG_ZERO;
  }

  if (!isFiniteNumber(price)) {
    if (WARN_STAKED_MISSING_PRICE) {
      console.warn(
        `getTotalStakedInUsd for ${pool.oracleId}: failed to get price for underlying ${pool.stakedToken.oracleId}`
      );
    }
    return BIG_ZERO;
  }

  // shares -> want (if pricePerFullShare is provided)
  const totalUnderlyingStaked = fromWei(toBigNumber(totalStaked), pool.stakedToken.decimals).times(
    pool.stakedToken.pricePerFullShare ? pool.stakedToken.pricePerFullShare.shiftedBy(-18) : BIG_ONE
  );
  return totalUnderlyingStaked.times(price);
}
