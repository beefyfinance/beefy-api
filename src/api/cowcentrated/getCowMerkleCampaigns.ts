import { ApiChain, toChainId } from '../../utils/chain';
import { sleep } from '../../utils/time';
import { groupBy, mapValues, partition } from 'lodash';
import { isResultFulfilled } from '../../utils/promise';
import { getKey, setKey } from '../../utils/cache';
import { Address, isAddressEqual } from 'viem';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { getCowPoolChains, getCowPools } from './getCowPools';
import { CowPool } from './types';
import { isFiniteNumber } from '../../utils/number';

const INIT_DELAY = 5000; // 5 seconds
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'COWCENTRATED_MERKL_CAMPAIGNS';
const CAMPAIGN_CREATOR_TO_TYPE: Record<Address, 'test' | 'lltip'> = {
  '0xb1F1000b4FCae7CD07370cE1A3E3b11270caC0dE': 'test',
  '0xD80e5884C1E2771D4d2A6b3b7C240f10EfA0c766': 'lltip',
};
let merklCampaignsByChain: Partial<Record<ApiChain, Campaign[]>> = {};
let merklBeefyCampaignsByChain: Partial<Record<ApiChain, Campaign[]>> = {};

type ApiForwarder = {
  almAPR: number;
  almAddress: Address;
  forwarderType: number;
  priority: number;
  sender: Address;
  target: Address;
  owner: Address;
  type: number;
};

type ApiCampaign = {
  chainId: number;
  campaignId: string;
  creator: Address;
  startTimestamp: number;
  endTimestamp: number;
  /** supposed to be an address but some have extra space on end */
  mainParameter: string;
  forwarders: ApiForwarder[];
};

type ApiCampaignsResponse = {
  [chainId: string]: {
    [poolTypeId: string]: {
      [campaignId: string]: ApiCampaign;
    };
  };
};

type CampaignVault = {
  id: string;
  address: string;
  apr: number;
};

type Campaign = {
  campaignId: string;
  startTimestamp: number;
  endTimestamp: number;
  chainId: ApiChain;
  poolAddress: string;
  type: 'test' | 'lltip' | 'external';
  vaults: CampaignVault[];
};

function getCampaign(
  apiChain: ApiChain,
  campaign: ApiCampaign,
  pools: ReadonlyArray<CowPool>
): Campaign | undefined {
  const type = CAMPAIGN_CREATOR_TO_TYPE[campaign.creator] || 'external';
  const vaults = pools.filter(
    p => p.lpAddress.toLowerCase() === campaign.mainParameter.toLowerCase()
  );
  if (!vaults.length) {
    return undefined;
  }

  const vaultsWithApr = vaults.map(vault => {
    let totalApr: number = 0;

    const poolForwarders = campaign.forwarders.filter(forwarder =>
      isAddressEqual(forwarder.almAddress, vault.address)
    );
    if (poolForwarders.length > 0) {
      totalApr = poolForwarders.reduce((acc, forwarder) => {
        if (isFiniteNumber(forwarder.almAPR)) {
          acc += forwarder.almAPR / 100;
        }
        return acc;
      }, 0);
    }

    return {
      id: vault.oracleId,
      address: vault.address,
      apr: totalApr,
    };
  });

  return {
    campaignId: campaign.campaignId,
    chainId: apiChain,
    startTimestamp: campaign.startTimestamp,
    endTimestamp: campaign.endTimestamp,
    poolAddress: campaign.mainParameter,
    vaults: vaultsWithApr,
    type,
  };
}

async function updateChain(apiChain: ApiChain) {
  const chainId = toChainId(apiChain);
  const url = `https://api.merkl.xyz/v3/campaigns?chainIds=${chainId}`;
  const response = await fetch(url);
  const data = (await response.json()) as ApiCampaignsResponse;
  const chainData = data[chainId];
  if (!chainData) {
    throw new Error(`No data for chain ${apiChain}`);
  }

  const campaigns: Campaign[] = [];
  const pools = getCowPools(apiChain);

  for (const apiPool of Object.values(chainData)) {
    for (const apiCampaign of Object.values(apiPool)) {
      const campaign = getCampaign(apiChain, apiCampaign, pools);
      if (campaign) {
        campaigns.push(campaign);
      }
    }
  }

  return { chain: apiChain, campaigns };
}

async function buildLookupHelpers() {
  const allCampaigns = Object.values(merklCampaignsByChain).flat();

  merklBeefyCampaignsByChain = {
    ...mapValues(merklCampaignsByChain, () => []),
    ...groupBy(
      allCampaigns.filter(campaign => campaign.type !== 'external'),
      'chainId'
    ),
  };
}

async function updateAll() {
  try {
    console.log('> [CLM Merkl] Updating merkl campaigns...');
    const start = Date.now();
    const updates = await Promise.allSettled(getCowPoolChains().map(updateChain));
    const [fulfilled, rejected] = partition(updates, isResultFulfilled);

    if (fulfilled.length) {
      for (const {
        value: { chain, campaigns },
      } of fulfilled) {
        merklCampaignsByChain[chain] = campaigns;
      }
      await saveToCache();
    }

    const timing = (Date.now() - start) / 1000;
    console.log(
      `> [CLM Merkl] Merkl campaigns updated in ${timing}s, successes: ${fulfilled.length}, failures: ${rejected.length}`
    );
    if (rejected.length) {
      rejected.forEach(result => console.error(result.reason));
    }
  } finally {
    scheduleUpdate();
  }
}

function scheduleUpdate(wait = UPDATE_INTERVAL) {
  sleep(wait)
    .then(updateAll)
    .catch(err => {
      console.error(`> [CLM Merkl] Update all failed`, err);
      scheduleUpdate();
    });
}

export async function initCowMerklService() {
  console.log(' > [CLM Merkl] Initializing...');
  await loadFromCache();
  scheduleUpdate(INIT_DELAY);
}

async function loadFromCache() {
  const cached = await getKey(CACHE_KEY);
  if (cached) {
    merklCampaignsByChain = cached;
    await buildLookupHelpers();
  }
}

async function saveToCache() {
  await buildLookupHelpers();
  await setKey(CACHE_KEY, merklCampaignsByChain);
}

export function getCowMerklCampaignsByChain() {
  return merklCampaignsByChain;
}

export function getCowMerklCampaignsForChain(chain: ApiChain) {
  return merklCampaignsByChain[chain];
}

// only campaigns created by beefy
export function getCowBeefyMerklCampaignsByChain() {
  return merklBeefyCampaignsByChain;
}

export function getCowBeefyMerklCampaignsForChain(chain: ApiChain) {
  return merklBeefyCampaignsByChain[chain];
}
