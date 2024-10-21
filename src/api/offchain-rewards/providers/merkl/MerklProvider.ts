import { AppChain, fromChainNumber, toAppChain, toChainId } from '../../../../utils/chain';
import { CampaignType, IOffchainRewardProvider, MerklCampaign, Vault } from '../../types';
import { isProviderApiError, ProviderApiError, UnsupportedChainError } from '../../errors';
import { CampaignTypeSetting, MerklApiCampaign, MerklApiCampaignsResponse } from './types';
import { groupBy } from 'lodash';
import { Address, getAddress, isAddressEqual } from 'viem';
import { isFiniteNumber } from '../../../../utils/number';
import { isDefined } from '../../../../utils/array';
import { isUnixBetween } from '../../../../utils/date';
import { getJson } from '../../../../utils/http';

const providerId = 'merkl' as const;
const throwIfNoData: boolean = false; // whether to throw if "{}" is returned
const supportedChains = new Set<AppChain>([
  'ethereum',
  'polygon',
  'optimism',
  'arbitrum',
  'base',
  'gnosis',
  'zkevm',
  'mantle',
  'mode',
  'linea',
  'bsc',
  'zksync',
  'fuse',
  'moonbeam',
  'manta',
  'fraxtal',
  'celo',
  'sei',
  'rootstock',
]);
const campaignCreatorToType: Record<Address, CampaignTypeSetting> = {
  '0xb1F1000b4FCae7CD07370cE1A3E3b11270caC0dE': 'test',
  '0xD80e5884C1E2771D4d2A6b3b7C240f10EfA0c766': {
    arbitrum: 'arb-ltipp',
    default: 'external', // we do not own this address on other chains
  },
  '0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE': {
    optimism: 'op-gov-fund',
    default: 'external', // we do not own this address on other chains
  },
  '0x55A0f096EA315C93809D9a1D5E3667f6dae3fB15': {
    base: 'zap-v3',
    default: 'external', // we do not own this address on other chains
  },
  '0x2cf13cEd9960Fd3a081108f283b7725Fe8d48C9e': {
    mode: 'mode-grant',
    default: 'external',
  },
};

export class MerklProvider implements IOffchainRewardProvider {
  public readonly id = providerId;

  supportsChain(chainId: AppChain): boolean {
    return supportedChains.has(chainId);
  }

  supportsVault(vault: Vault): boolean {
    return vault.type !== 'standard' && this.supportsChain(vault.chainId);
  }

  isActive(campaign: MerklCampaign, unixTime: number): boolean {
    return isUnixBetween(campaign.startTimestamp, campaign.endTimestamp, unixTime);
  }

  async getCampaigns(chainId: AppChain, vaults: Vault[]): Promise<MerklCampaign[]> {
    if (!this.supportsChain(chainId)) {
      throw new UnsupportedChainError(chainId, providerId);
    }

    const vaultsByPoolAddress = groupBy(vaults, v => v.poolAddress.toLowerCase());
    const chainData = await this.fetchCampaignsForChain(chainId);

    return Object.values(chainData)
      .flatMap(poolData => Object.values(poolData))
      .map(campaign => this.getCampaign(campaign, chainId, vaultsByPoolAddress))
      .filter(isDefined);
  }

  protected getCampaignType(creator: Address, chain: AppChain): CampaignType {
    const type = campaignCreatorToType[creator] || 'external';
    if (typeof type === 'string') {
      return type;
    }

    return type[chain] || type.default || 'external';
  }

  protected getCampaign(
    apiCampaign: MerklApiCampaign,
    chainId: AppChain,
    vaultsByPoolAddress: Record<string, Vault[]>
  ): MerklCampaign | undefined {
    // skip campaigns with merkl test token reward
    if (apiCampaign.campaignParameters.symbolRewardToken === 'aglaMerkl') {
      return undefined;
    }

    const vaults = vaultsByPoolAddress[apiCampaign.mainParameter.toLowerCase()];
    if (!vaults) {
      return undefined;
    }

    const vaultsWithApr = vaults.map(vault => {
      let totalApr: number = 0;

      const poolForwarders = apiCampaign.forwarders.filter(forwarder => {
        const almAddress = getAddress(forwarder.almAddress);
        return isAddressEqual(almAddress, vault.address);
      });

      if (poolForwarders.length > 0) {
        totalApr = poolForwarders.reduce((acc, forwarder) => {
          if (isFiniteNumber(forwarder.almAPR)) {
            acc += forwarder.almAPR / 100;
          }
          return acc;
        }, 0);
      }

      return {
        ...vault,
        apr: totalApr,
      };
    });

    const computeChain = apiCampaign.computeChainId ? fromChainNumber(apiCampaign.computeChainId) : undefined;
    const claimChain = apiCampaign.chainId ? fromChainNumber(apiCampaign.chainId) : undefined;

    return {
      id: `merkl:${apiCampaign.campaignId}`,
      providerId,
      campaignId: apiCampaign.campaignId,
      chainId: toAppChain(computeChain ?? claimChain ?? chainId),
      startTimestamp: apiCampaign.startTimestamp,
      endTimestamp: apiCampaign.endTimestamp,
      poolAddress: getAddress(apiCampaign.mainParameter),
      active: isUnixBetween(apiCampaign.startTimestamp, apiCampaign.endTimestamp),
      rewardToken: {
        address: getAddress(apiCampaign.rewardToken),
        symbol: apiCampaign.campaignParameters.symbolRewardToken,
        decimals: apiCampaign.campaignParameters.decimalsRewardToken,
        chainId: toAppChain(claimChain ?? chainId),
        type: 'erc20',
      },
      vaults: vaultsWithApr,
      type: this.getCampaignType(getAddress(apiCampaign.creator), chainId),
    };
  }

  protected async fetchCampaignsForChain(chainId: AppChain): Promise<MerklApiCampaignsResponse[string]> {
    const numericChainId = toChainId(chainId);

    try {
      const data = await getJson<MerklApiCampaignsResponse>({
        url: 'https://api.merkl.xyz/v3/campaigns',
        params: {
          chainIds: numericChainId,
        },
      });
      if (!data || typeof data !== 'object') {
        throw new ProviderApiError(`fetchCampaignsForChain(${chainId}): response error`, providerId);
      }

      if (Object.keys(data).length === 0) {
        if (throwIfNoData) {
          throw new ProviderApiError(`fetchCampaignsForChain(${chainId}): no data returned`, providerId);
        }
        return {};
      }

      const dataForChain = data[numericChainId];
      if (!dataForChain) {
        throw new ProviderApiError(
          `fetchCampaignsForChain(${chainId}): no data for chain returned`,
          providerId
        );
      }

      return dataForChain;
    } catch (err: unknown) {
      if (isProviderApiError(err)) {
        throw err;
      }
      throw new ProviderApiError(
        `fetchCampaignsForChain(${chainId}): ${err && err instanceof Error ? err.message : 'unknown error'}`,
        providerId,
        err && err instanceof Error ? err : undefined
      );
    }
  }
}
