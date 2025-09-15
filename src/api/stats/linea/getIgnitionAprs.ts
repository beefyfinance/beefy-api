import { Address, getAddress } from 'viem';
import { getJson } from '../../../utils/http';
import { isFiniteNumber } from '../../../utils/number';
import { AsyncCache } from '../../../utils/promise';

type CampaignInfo = {
  protocol: string;
  poolAddr: Address;
  campaignId: string;
  lastWeekRewards: number;
  lastWeekApr: `${number}%`;
  tvl: number;
};

type CampaignInfoResponseSuccess = {
  err: null;
  campaignInfo: CampaignInfo[];
};

type CampaignInfoResponseError = {
  err: string;
};

type CampaignInfoResponse = CampaignInfoResponseSuccess | CampaignInfoResponseError;

export type IgnitionAprs = Record<Address, number>;

function isResponseSuccess(response: CampaignInfoResponse): response is CampaignInfoResponseSuccess {
  return response.err === null;
}

export const getIgnitionAprs = AsyncCache.wrap(
  async (protocol: string): Promise<IgnitionAprs> => {
    try {
      const result = await getJson<CampaignInfoResponse>({
        url: 'https://linea-ignition-api.brevis.network/v1/getCampaignInfo',
        params: {
          protocol,
        },
      });

      if (!isResponseSuccess(result)) {
        console.error('[Ignition] Error in aprs response', result.err);
        return {};
      }

      return result.campaignInfo.reduce((acc, info) => {
        const match = info.lastWeekApr.match(/^([0-9.]+)%$/);
        if (!match) {
          console.warn(`[Ignition] Unexpected APR format: ${info.lastWeekApr} for pool ${info.poolAddr}`);
          return acc;
        }

        const apr = parseFloat(match[1]);
        if (!isFiniteNumber(apr)) {
          console.warn(`[Ignition] Non-finite APR: ${apr} (${info.lastWeekApr}) for pool ${info.poolAddr}`);
          return acc;
        }

        acc[getAddress(info.poolAddr)] = apr / 100;
        return acc;
      }, {} as IgnitionAprs);
    } catch (e) {
      console.error('[Ignition] Error fetching aprs', e);
      return {};
    }
  },
  { ttl: 120 }
);
