import { ApiChain, toChainId } from '../../utils/chain';
import { sleep } from '../../utils/time';
import { partition } from 'lodash';
import { isResultFulfilled } from '../../utils/promise';
import { getKey, setKey } from '../../utils/cache';

const INIT_DELAY = 5000; // 5 seconds
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CAMPAIGN_CHAINS: ApiChain[] = ['arbitrum', 'optimism'];
const CAMPAIGN_CREATOR = '0xb1F1000b4FCae7CD07370cE1A3E3b11270caC0dE';
const CACHE_KEY = 'COWCENTRATED_MERKL_CAMPAIGNS';
const merkleCampaigns: Partial<Record<ApiChain, Campaign[]>> = {};

type CampaignsResponse = {
  [chainId: string]: {
    [poolTypeId: string]: {
      [campaignId: string]: {
        chainId: number;
        campaignId: string;
        creator: string;
        startTimestamp: number;
        endTimestamp: number;
        mainParameter: string;
      };
    };
  };
};

type Campaign = {
  campaignId: string;
  startTimestamp: number;
  endTimestamp: number;
  poolAddress: string;
};

async function updateChain(apiChain: ApiChain) {
  const chainId = toChainId(apiChain);
  const url = `https://api.merkl.xyz/v3/campaigns?chainIds=${chainId}`;
  const response = await fetch(url);
  const data = (await response.json()) as CampaignsResponse;
  const chainData = data[chainId];
  if (!chainData) {
    throw new Error(`No data for chain ${apiChain}`);
  }

  const campaigns: Campaign[] = [];

  for (const pool of Object.values(chainData)) {
    for (const campaign of Object.values(pool)) {
      if (campaign.creator === CAMPAIGN_CREATOR) {
        campaigns.push({
          campaignId: campaign.campaignId,
          startTimestamp: campaign.startTimestamp,
          endTimestamp: campaign.endTimestamp,
          poolAddress: campaign.mainParameter,
        });
      }
    }
  }

  return { chain: apiChain, campaigns };
}

async function updateAll() {
  try {
    console.log('> [CLM Merkl] Updating merkl campaigns...');
    const start = Date.now();
    const updates = await Promise.allSettled(CAMPAIGN_CHAINS.map(updateChain));
    const [fulfilled, rejected] = partition(updates, isResultFulfilled);

    if (fulfilled.length) {
      for (const {
        value: { chain, campaigns },
      } of fulfilled) {
        merkleCampaigns[chain] = campaigns;
      }
      await saveToCache();
    }

    const timing = (Date.now() - start) / 1000;
    console.log(
      `> [CLM Merkl] Merkl campaigns updated in ${timing}s, successes: ${fulfilled.length}, failures: ${rejected.length}`
    );
  } finally {
    scheduleUpdate();
  }
}

function scheduleUpdate() {
  sleep(UPDATE_INTERVAL)
    .then(updateAll)
    .catch(err => {
      console.error(`> [CLM Merkl] Update all failed`, err);
      scheduleUpdate();
    });
}

export async function initCowMerklService() {
  await loadFromCache();
}

async function loadFromCache() {
  const cached = await getKey(CACHE_KEY);
  if (cached) {
    Object.assign(merkleCampaigns, cached);
  }

  setTimeout(updateAll, INIT_DELAY);
}

async function saveToCache() {
  await setKey(CACHE_KEY, merkleCampaigns);
}

export function getCowMerklCampaigns() {
  return merkleCampaigns;
}

export function getCowMerklCampaignsForChain(chain: ApiChain) {
  return merkleCampaigns[chain];
}
