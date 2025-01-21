import { AppChain, toChainId } from '../../../../utils/chain';
import { IOffchainRewardProvider, RewardToken, StellaSwapCampaign, Vault } from '../../types';
import { groupBy, mapKeys } from 'lodash';
import { isProviderApiError, ProviderApiError, UnsupportedChainError } from '../../errors';
import { Address, getAddress } from 'viem';
import { isFiniteNumber, toNumber } from '../../../../utils/number';
import { bigintRange, isDefined } from '../../../../utils/array';
import { FarmingAprResponse, FarmingAprResult, RewarderEntry, RewardInfo } from './types';
import { fetchContract } from '../../../rpc/client';
import { rewarderAbi, rewardRegistryAbi } from './abi';
import { getUnixNow, isUnixBetween } from '../../../../utils/date';
import { moonbeam } from '../../../../../packages/address-book/src/address-book/moonbeam';
import { getJson } from '../../../../utils/http';

const providerId = 'stellaswap' as const;
const supportedChains = new Set<AppChain>(['moonbeam']);
const supportedVaultTypes = new Set<Vault['type']>(['cowcentrated', 'cowcentrated-pool']);
const rewardRegistryAddress: Address = '0x0e4cAEf48De8FEc07b7dfeae8D73848Aaa8be0cB';

export class StellaSwapProvider implements IOffchainRewardProvider {
  public readonly id = providerId;

  supportsChain(chainId: AppChain): boolean {
    return supportedChains.has(chainId);
  }

  supportsVault(vault: Vault): boolean {
    return supportedVaultTypes.has(vault.type) && this.supportsChain(vault.chainId);
  }

  isActive(campaign: StellaSwapCampaign, unixTime: number): boolean {
    return !campaign.isPaused && isUnixBetween(campaign.startTimestamp, campaign.endTimestamp, unixTime);
  }

  async getCampaigns(chainId: AppChain, vaults: Vault[]): Promise<StellaSwapCampaign[]> {
    if (!this.supportsChain(chainId)) {
      throw new UnsupportedChainError(chainId, providerId);
    }

    const vaultsByPoolAddress = groupBy(vaults, v => v.poolAddress.toLowerCase());
    const rewarders = await this.fetchRewarders(chainId);
    if (rewarders.length === 0) {
      return [];
    }

    const rewardersForVaults = rewarders.filter(p => !!vaultsByPoolAddress[p.poolAddress.toLowerCase()]);
    if (rewardersForVaults.length === 0) {
      return [];
    }

    const aprByPoolAddress = mapKeys((await this.fetchFarmingApr()).pools, (_, poolAddress) =>
      poolAddress.toLowerCase()
    );

    return (
      await Promise.all(
        rewardersForVaults.map(async rewarder => {
          const poolAddressKey = rewarder.poolAddress.toLowerCase();
          const vaults = vaultsByPoolAddress[poolAddressKey];
          const rewardInfos = await this.fetchRewardInfos(chainId, rewarder.rewarderAddress);
          const tokenAprsForPool = aprByPoolAddress[poolAddressKey];
          if (!tokenAprsForPool && !rewarder.isPaused) {
            console.warn(
              `StellaSwapProvider: missing APRs for pool ${rewarder.poolAddress} (${rewarder.rewarderAddress} [unpaused])`
            );
          }

          const tokenAprs = tokenAprsForPool
            ? mapKeys(tokenAprsForPool.tokenRewards, (_, tokenAddress) => tokenAddress.toLowerCase())
            : {};

          return rewardInfos.map(reward => {
            const tokenAddress = getAddress(reward.tokenAddress);
            const tokenApr = tokenAprs[tokenAddress.toLowerCase()];
            const rewardActive =
              !rewarder.isPaused && isUnixBetween(reward.startTimestamp, reward.endTimestamp);
            if (rewardActive && (!tokenApr || !isFiniteNumber(tokenApr.beefyApr))) {
              console.warn(
                `StellaSwapProvider: missing beefyApr for active reward ${tokenAddress} for pool ${rewarder.poolAddress}`
              );
            }
            const apr = tokenApr && rewardActive ? toNumber(tokenApr.beefyApr, 0) / 100 : 0;
            const rewardToken = this.getRewardToken(chainId, reward, tokenApr);
            if (!rewardToken) {
              console.error(
                `StellaSwapProvider: unknown token ${tokenAddress} active reward for pool ${rewarder.poolAddress} (${rewarder.rewarderAddress} ${reward.rewardId})`
              );
              return undefined;
            }

            return {
              id: `stellaswap:${rewarder.poolAddress}:${reward.rewardId}`,
              chainId,
              providerId,
              poolAddress: rewarder.poolAddress,
              type: 'external' as const,
              rewardToken,
              startTimestamp: reward.startTimestamp,
              endTimestamp: reward.endTimestamp,
              active: rewardActive,
              rewardId: reward.rewardId,
              rewarderAddress: rewarder.rewarderAddress,
              isPaused: rewarder.isPaused,
              vaults: vaults.map(vault => ({
                ...vault,
                apr,
              })),
            };
          });
        })
      )
    )
      .flat()
      .filter(isDefined)
      .map(campaign => {
        campaign.active = this.isActive(campaign, getUnixNow());
        return campaign;
      });
  }

  protected getRewardToken(
    chainId: AppChain,
    reward: RewardInfo,
    tokenApr?: FarmingAprResult['pools'][string]['tokenRewards'][string]
  ): RewardToken | undefined {
    if (reward.isNative) {
      return {
        address: moonbeam.tokens.WGLMR.address,
        symbol: 'GLMR',
        decimals: 18,
        chainId,
        type: 'native',
      };
    }

    const tokenAddress = getAddress(reward.tokenAddress);

    if (tokenApr) {
      return {
        address: tokenAddress,
        symbol: tokenApr.symbol,
        decimals: toNumber(tokenApr.decimals, 18),
        chainId,
        type: 'erc20',
      };
    }

    const maybeToken = moonbeam.tokenAddressMap[tokenAddress];
    if (maybeToken) {
      return {
        address: tokenAddress,
        symbol: maybeToken.symbol,
        decimals: maybeToken.decimals,
        chainId,
        type: 'erc20',
      };
    }

    return undefined;
  }

  protected async fetchRewarders(appChain: AppChain): Promise<RewarderEntry[]> {
    const chainId = toChainId(appChain);
    const rewardRegistry = fetchContract(rewardRegistryAddress, rewardRegistryAbi, chainId);
    const pools = await rewardRegistry.read.getAllPools();

    return pools.map(pool => ({
      poolAddress: pool.pool,
      rewarderAddress: pool.rewarder,
      isPaused: pool.isPaused,
    }));
  }

  protected async fetchRewardInfos(appChain: AppChain, rewarderAddress: Address): Promise<RewardInfo[]> {
    const chainId = toChainId(appChain);
    const rewarder = fetchContract(rewarderAddress, rewarderAbi, chainId);
    const numRewards = await rewarder.read.rewardInfoLength();
    const rewards = await Promise.all(bigintRange(numRewards).map(i => rewarder.read.rewardInfo([i])));

    return rewards.map((reward, rewardId) => ({
      rewardId,
      tokenAddress: reward[0],
      isNative: reward[1],
      startTimestamp: reward[2],
      endTimestamp: reward[3],
    }));
  }

  protected async fetchFarmingApr(): Promise<FarmingAprResult> {
    try {
      const data = await getJson<FarmingAprResponse>({
        url: 'https://apr-api.stellaswap.com/api/v1/offchain/farmingAPR',
      });
      if (!data.isSuccess) {
        throw new ProviderApiError(`fetchFarmingApr: response error`, providerId);
      }

      return data.result;
    } catch (err: unknown) {
      if (isProviderApiError(err)) {
        throw err;
      }
      throw new ProviderApiError(
        `fetchFarmingApr: ${err && err instanceof Error ? err.message : 'unknown error'}`,
        providerId,
        err && err instanceof Error ? err : undefined
      );
    }
  }
}
