import { AppChain } from '../../../../utils/chain';
import { IOffchainRewardProvider, StellaswapCampaign, Vault } from '../../types';
import { groupBy } from 'lodash';
import { isProviderApiError, ProviderApiError, UnsupportedChainError } from '../../errors';
import { getAddress } from 'viem';
import { toNumber } from '../../../../utils/number';
import { isDefined } from '../../../../utils/array';

const providerId = 'stellaswap' as const;
const supportedChains = new Set<AppChain>(['moonbeam']);

export class StellaswapProvider implements IOffchainRewardProvider {
  public readonly id = providerId;

  supportsChain(chainId: AppChain): boolean {
    return supportedChains.has(chainId);
  }

  supportsVault(vault: Vault): boolean {
    return vault.type !== 'standard' && this.supportsChain(vault.chainId);
  }

  isActive(campaign: StellaswapCampaign, _unixTime: number): boolean {
    // we have no way to know if still active w/out re-fetching data
    return campaign.active;
  }

  async getCampaigns(chainId: AppChain, vaults: Vault[]): Promise<StellaswapCampaign[]> {
    if (!this.supportsChain(chainId)) {
      throw new UnsupportedChainError(chainId, providerId);
    }

    const vaultsByPoolAddress = groupBy(vaults, v => v.poolAddress.toLowerCase());

    const result = await this.fetchFarmingApr();
    return Object.entries(result.pools)
      .flatMap(([poolAddress, pool]) => {
        const vaults = vaultsByPoolAddress[poolAddress.toLowerCase()];
        if (!vaults) {
          return undefined;
        }

        return Object.entries(pool.tokenRewards).map(([tokenAddress, reward]) => {
          const apr = toNumber(reward.apr, 0);
          return {
            id: `stellaswap:${poolAddress}:${reward.id}`,
            chainId,
            providerId,
            poolAddress: getAddress(poolAddress),
            active: apr > 0,
            type: 'external' as const,
            rewardToken: {
              address: getAddress(tokenAddress),
              symbol: reward.symbol,
              decimals: toNumber(reward.decimals, 18),
              chainId,
            },
            vaults: vaults.map(vault => ({
              ...vault,
              apr: apr / 100,
            })),
          };
        });
      })
      .filter(isDefined);
  }

  protected async fetchFarmingApr(): Promise<FarmingAprResult> {
    try {
      const response = await fetch(`https://apr-api.stellaswap.io/api/v1/offchain/farmingAPR`);
      if (!response.ok) {
        throw new ProviderApiError(
          `fetchFarmingApr: ${response.status} ${response.statusText}`,
          providerId
        );
      }
      const data = (await response.json()) as FarmingAprResponse;
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
