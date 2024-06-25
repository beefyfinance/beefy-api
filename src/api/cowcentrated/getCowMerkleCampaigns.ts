import { ApiChain, toChainId } from '../../utils/chain';
import { sleep } from '../../utils/time';
import { groupBy, mapValues, partition } from 'lodash';
import { isResultFulfilled } from '../../utils/promise';
import { getKey, setKey } from '../../utils/cache';
import { Address, isAddressEqual } from 'viem';
import { getCowClmChains, getCowClms } from './getCowClms';
import {
  Campaign,
  CampaignType,
  CampaignTypeSetting,
  CowClm,
  MerklApiCampaign,
  MerklApiCampaignsResponse,
} from './types';
import { isFiniteNumber } from '../../utils/number';
import { getUnixTime } from 'date-fns';

const INIT_DELAY = 5000; // 5 seconds
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_KEY = 'COWCENTRATED_MERKL_CAMPAIGNS';
const CAMPAIGN_CREATOR_TO_TYPE: Record<Address, CampaignTypeSetting> = {
  '0xb1F1000b4FCae7CD07370cE1A3E3b11270caC0dE': 'test',
  '0xD80e5884C1E2771D4d2A6b3b7C240f10EfA0c766': {
    arbitrum: 'arb-ltipp',
    default: 'external', // we do not own this address on other chains
  },
  '0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE': {
    optimism: 'op-gov-fund',
    default: 'external', // we do not own this address on other chains
  },
};
let merklCampaignsByChain: Partial<Record<ApiChain, Campaign[]>> = {}; // redis
let merklBeefyCampaignsByChain: Partial<Record<ApiChain, Campaign[]>> = {}; // memory only

function getCampaignType(creator: Address, chain: ApiChain): CampaignType {
  const type = CAMPAIGN_CREATOR_TO_TYPE[creator] || 'external';
  if (typeof type === 'string') {
    return type;
  }

  return type[chain] || type.default || 'external';
}

function getCampaign(
  apiChain: ApiChain,
  campaign: MerklApiCampaign,
  pools: ReadonlyArray<CowClm>,
  unixTimestamp: number
): Campaign | undefined {
  const type = getCampaignType(campaign.creator, apiChain);
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
    fetchedTimestamp: unixTimestamp,
    type,
  };
}

async function updateChain(apiChain: ApiChain) {
  const chainId = toChainId(apiChain);
  const url = `https://api.merkl.xyz/v3/campaigns?chainIds=${chainId}`;
  const response = await fetch(url);
  const data = (await response.json()) as MerklApiCampaignsResponse;
  const chainData = data[chainId];
  if (!chainData) {
    throw new Error(`No data for chain ${apiChain}`);
  }

  const campaigns: Campaign[] = [];
  const pools = getCowClms(apiChain);
  const now = getUnixTime(new Date());

  for (const apiPool of Object.values(chainData)) {
    for (const apiCampaign of Object.values(apiPool)) {
      const campaign = getCampaign(apiChain, apiCampaign, pools, now);
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
    const updates = await Promise.allSettled(getCowClmChains().map(updateChain));
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
