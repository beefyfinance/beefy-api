import { AppChain, fromChainNumber, toAppChain, toChainId } from '../../../../utils/chain';
import { CampaignType, IOffchainRewardProvider, MerklCampaign, Vault } from '../../types';
import { isProviderApiError, ProviderApiError, UnsupportedChainError } from '../../errors';
import {
  CampaignTypeSetting,
  MerklApiCampaign,
  MerklApiCampaignType,
  MerklApiOpportunitiesParams,
  MerklApiOpportunitiesRequest,
  MerklApiOpportunitiesWithCampaignsResponse,
  MerklApiOpportunityStatus,
  MerklApiOpportunityWithCampaigns,
} from './types';
import { groupBy, omit, pick } from 'lodash';
import { Address, getAddress, isAddressEqual } from 'viem';
import { isFiniteNumber } from '../../../../utils/number';
import { isDefined } from '../../../../utils/array';
import { getUnixNow, isUnixBetween } from '../../../../utils/date';
import { getJson } from '../../../../utils/http';
import { errorToString, isError } from '../../../../utils/error';

const providerId = 'merkl' as const;
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
  'sonic',
  'lisk',
  'saga',
  'hyperevm',
]);
const supportedCampaignTypeToVaultType: Map<MerklApiCampaignType, Set<Vault['type']>> = new Map([
  ['ERC20', new Set<Vault['type']>(['standard'])],
  ['CLAMM', new Set<Vault['type']>(['cowcentrated', 'cowcentrated-pool'])],
]);
const supportedVaultTypes = new Set<Vault['type']>(
  Array.from(supportedCampaignTypeToVaultType.values(), v => Array.from(v.values())).flat()
);
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
const MAX_PER_PAGE = 100; // @see https://api.merkl.xyz/docs#tag/opportunities/get/v4/opportunities
const MAX_CAMPAIGN_AGE = 60 * 60 * 24 * 30; // 30 days in seconds, used to filter out campaigns that ended a long time ago

export class MerklProvider implements IOffchainRewardProvider {
  public readonly id = providerId;

  supportsChain(chainId: AppChain): boolean {
    return supportedChains.has(chainId);
  }

  supportsVault(vault: Vault): boolean {
    return supportedVaultTypes.has(vault.type) && this.supportsChain(vault.chainId);
  }

  isActive(campaign: MerklCampaign, unixTime: number): boolean {
    return isUnixBetween(campaign.startTimestamp, campaign.endTimestamp, unixTime);
  }

  async getCampaigns(chainId: AppChain, vaults: Vault[]): Promise<MerklCampaign[]> {
    if (!this.supportsChain(chainId)) {
      throw new UnsupportedChainError(chainId, providerId);
    }

    const vaultsByPoolAddress = groupBy(vaults, v => v.poolAddress.toLowerCase());
    const opportunities = await this.fetchOpportunitiesForChain(chainId);

    return opportunities
      .flatMap(opportunity => this.getCampaignsFromOpportunity(opportunity, chainId, vaultsByPoolAddress))
      .filter(isDefined);
  }

  protected getCampaignsFromOpportunity(
    opportunity: MerklApiOpportunityWithCampaigns,
    chainId: AppChain,
    vaultsByPoolAddress: Record<string, Vault[]>
  ): MerklCampaign[] {
    const campaignToAprShare = new Map(
      opportunity.aprRecord.breakdowns
        .filter(b => b.type === 'CAMPAIGN')
        .map(b => [
          b.identifier,
          opportunity.aprRecord.cumulated > 0 ? b.value / opportunity.aprRecord.cumulated : 0,
        ])
    );

    return opportunity.campaigns.map(c =>
      this.getCampaign(
        opportunity,
        c,
        campaignToAprShare.get(c.campaignId) ?? 0,
        chainId,
        vaultsByPoolAddress
      )
    );
  }

  protected getCampaignType(creator: Address, chain: AppChain): CampaignType {
    const type = campaignCreatorToType[creator] || 'external';
    if (typeof type === 'string') {
      return type;
    }

    return type[chain] || type.default || 'external';
  }

  protected breakdownIdentifierToClmAddress(identifier: string): Address | undefined {
    // Beefy 0x4fc9ba822d77617a099908edf7d1deda4267ad1a
    // BeefyStaker 0x6bedf19d5851e3bf0c0cd308b96527c7a93e0587
    const matches = identifier.trim().match(/^(Beefy|BeefyStaker) (0x[a-fA-F0-9]{40})$/i);
    const address = matches?.[2];
    return address ? getAddress(address) : undefined;
  }

  protected getVaultsWithAprFromCampaign(
    vaults: Vault[],
    apiOpportunity: MerklApiOpportunityWithCampaigns,
    apiCampaign: MerklApiCampaign,
    /** campaign apr / opportunity apr */
    aprShare: number
  ) {
    switch (apiCampaign.type) {
      case 'ERC20': {
        // @dev `opportunity.identifier` already matched against `vault.poolAddress`
        return vaults.map(vault => {
          return {
            ...vault,
            apr: isFiniteNumber(apiOpportunity.apr) ? (apiOpportunity.apr / 100) * aprShare : 0,
          };
        });
      }
      case 'CLAMM': {
        return vaults.map(vault => {
          let totalApr: number = 0;

          const aprBreakdowns = apiOpportunity.aprRecord.breakdowns.filter(breakdown => {
            const clmAddress = this.breakdownIdentifierToClmAddress(breakdown.identifier);
            return clmAddress && isAddressEqual(clmAddress, vault.address);
          });

          if (aprBreakdowns.length > 0) {
            totalApr = aprBreakdowns.reduce((acc, breakdown) => {
              if (isFiniteNumber(breakdown.value)) {
                acc += (breakdown.value / 100) * aprShare;
              }
              return acc;
            }, 0);
          }

          return {
            ...vault,
            apr: totalApr,
          };
        });
      }
      default: {
        console.warn(`getVaultsWithAprFromCampaign: unsupported campaign type ${apiCampaign.type}`);
        return [];
      }
    }
  }

  protected getCampaign(
    apiOpportunity: MerklApiOpportunityWithCampaigns,
    apiCampaign: MerklApiCampaign,
    aprShare: number,
    chainId: AppChain,
    vaultsByPoolAddress: Record<string, Vault[]>
  ): MerklCampaign | undefined {
    const campaignAge = getUnixNow() - apiCampaign.endTimestamp;
    if (campaignAge > MAX_CAMPAIGN_AGE) {
      return undefined;
    }

    // skip campaigns with merkl test token reward
    if (apiCampaign.rewardToken.isTest || apiCampaign.rewardToken.symbol === 'aglaMerkl') {
      return undefined;
    }

    // skip unsupported campaign types
    if (!supportedCampaignTypeToVaultType.has(apiCampaign.type)) {
      return undefined;
    }

    // match vaults by pool address and campaign type support
    const vaults = vaultsByPoolAddress[apiOpportunity.identifier.toLowerCase()];
    if (!vaults) {
      return undefined;
    }
    const vaultsSupportingCampaignType = vaults.filter(vault =>
      supportedCampaignTypeToVaultType.get(apiCampaign.type)?.has(vault.type)
    );
    if (vaultsSupportingCampaignType.length === 0) {
      return undefined;
    }

    const vaultsWithApr = this.getVaultsWithAprFromCampaign(
      vaultsSupportingCampaignType,
      apiOpportunity,
      apiCampaign,
      aprShare
    );

    const computeChain = apiCampaign.computeChainId ? fromChainNumber(apiCampaign.computeChainId) : undefined;
    const claimChain = apiCampaign.distributionChainId
      ? fromChainNumber(apiCampaign.distributionChainId)
      : undefined;

    return {
      id: `merkl:${apiCampaign.campaignId}`,
      providerId,
      campaignId: apiCampaign.campaignId,
      campaignStatus: pick(apiCampaign.campaignStatus, ['computedUntil', 'processingStarted', 'status']),
      opportunityId: apiOpportunity.id,
      chainId: toAppChain(computeChain ?? claimChain ?? chainId),
      startTimestamp: apiCampaign.startTimestamp,
      endTimestamp: apiCampaign.endTimestamp,
      poolAddress: getAddress(apiOpportunity.identifier),
      active: isUnixBetween(apiCampaign.startTimestamp, apiCampaign.endTimestamp),
      rewardToken: {
        address: getAddress(apiCampaign.rewardToken.address),
        symbol: apiCampaign.rewardToken.symbol,
        decimals: apiCampaign.rewardToken.decimals,
        chainId: toAppChain(claimChain ?? chainId),
        type: 'erc20',
      },
      vaults: vaultsWithApr,
      type: this.getCampaignType(getAddress(apiCampaign.creator.address), chainId),
    };
  }

  protected async fetchOpportunitiesForChain(
    chainId: AppChain
  ): Promise<MerklApiOpportunitiesWithCampaignsResponse> {
    /**
     * @dev paging (page/items) is broken on /v4/opportunities/campaigns
     * so we are using the /v4/opportunities endpoint with ?campaigns=true
     * this endpoint is missing:
     * - `endTimestamp`, so we have to fetch `status` = LIVE and `status` = SOON separately
     */

    const perPage = MAX_PER_PAGE;
    const results: MerklApiOpportunitiesWithCampaignsResponse[] = [];
    const baseRequest: MerklApiOpportunitiesRequest = {
      chainId: toChainId(chainId),
      type: Array.from(supportedCampaignTypeToVaultType.keys()),
      page: 0,
      items: perPage,
    };

    for (const status of ['LIVE', 'SOON'] as const) {
      let page = 0;
      let morePages = false;

      do {
        const pageData = await this.fetchOpportunitiesForChainPage(baseRequest, status, page++);
        results.push(pageData);
        morePages = pageData.length >= perPage;
      } while (morePages);
    }

    return results.flat();
  }

  protected async fetchOpportunitiesForChainPage(
    request: MerklApiOpportunitiesRequest,
    status: MerklApiOpportunityStatus,
    page: number = 0
  ): Promise<MerklApiOpportunitiesWithCampaignsResponse> {
    if (request.items > MAX_PER_PAGE) {
      throw new ProviderApiError(
        `fetchCampaignsForChainPage(${request.chainId}): perPage ${request.items} exceeds maximum of ${MAX_PER_PAGE}`,
        providerId
      );
    }

    try {
      const data = await getJson<MerklApiOpportunitiesWithCampaignsResponse>({
        url: 'https://api.merkl.xyz/v4/opportunities',
        params: {
          page: page.toString(),
          items: request.items.toString(),
          chainId: request.chainId.toString(),
          type: request.type.join(','),
          test: 'false', // exclude test campaigns
          campaigns: 'true', // include campaigns in the response
          status,
        } satisfies MerklApiOpportunitiesParams,
      });
      if (!data || typeof data !== 'object' || !Array.isArray(data)) {
        throw new ProviderApiError(`fetchCampaignsForChain(${request.chainId}): response error`, providerId);
      }

      if (data.length === 0) {
        return [];
      }

      return data;
    } catch (err: unknown) {
      if (isProviderApiError(err)) {
        throw err;
      }
      throw new ProviderApiError(
        `fetchCampaignsForChain(${request.chainId}): ${errorToString(err)}`,
        providerId,
        isError(err) ? err : undefined
      );
    }
  }
}
