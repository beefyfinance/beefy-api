import { ApiChain, toChainId } from '../../utils/chain';
import { mapValues, partition } from 'lodash';
import { isResultFulfilled } from '../../utils/promise';
import { Address, isAddressEqual } from 'viem';
import { getCowClmChains, getCowClms } from './getCowClms';
import {
  Campaign,
  CampaignType,
  CampaignTypeSetting,
  CowClm,
  isCowClmWithRewardPool,
  MerklApiCampaign,
  MerklApiCampaignsResponse,
} from './types';
import { isFiniteNumber } from '../../utils/number';
import { CachedByChain } from '../../utils/CachedByChain';
import { CachedThrottledPromise } from '../../utils/CachedThrottledPromise';
import { sleep } from '../../utils/time';

const INIT_DELAY = 5000; // 5 seconds
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes
const MIN_UPDATE_INTERVAL = 10 * 60 * 1000; // will not update more often even if update called
const FRESH_LIFETIME = 30 * 60; // how many seconds is a response considered fresh for
const STALE_LIFETIME = 2 * 60 * 60; // how many additional seconds can a stale response be kept
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
const campaignStore = new CachedByChain<Campaign[]>({
  key: CACHE_KEY,
  fresh: FRESH_LIFETIME,
  stale: STALE_LIFETIME,
  version: 2, // increase if the shape of Campaign[] changes
});
const updater = new CachedThrottledPromise(updateAll, MIN_UPDATE_INTERVAL);

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
  clms: ReadonlyArray<CowClm>
): Campaign | undefined {
  // skip campaigns with merkl test token reward
  if (campaign.campaignParameters.symbolRewardToken === 'aglaMerkl') {
    return undefined;
  }

  const type = getCampaignType(campaign.creator, apiChain);
  const clmsForPool = clms.filter(
    p => p.lpAddress.toLowerCase() === campaign.mainParameter.toLowerCase()
  );
  if (!clmsForPool.length) {
    return undefined;
  }

  const vaults = clmsForPool.flatMap(clm => {
    const vaults = [{ id: clm.oracleId, address: clm.address }];
    if (isCowClmWithRewardPool(clm)) {
      vaults.push({ id: clm.rewardPool.oracleId, address: clm.rewardPool.address });
    }
    return vaults;
  });

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
      ...vault,
      apr: totalApr,
    };
  });

  return {
    campaignId: campaign.campaignId,
    chainId: apiChain,
    startTimestamp: campaign.startTimestamp,
    endTimestamp: campaign.endTimestamp,
    poolAddress: campaign.mainParameter,
    rewardToken: {
      address: campaign.rewardToken,
      symbol: campaign.campaignParameters.symbolRewardToken,
      decimals: campaign.campaignParameters.decimalsRewardToken,
    },
    vaults: vaultsWithApr,
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

async function updateAll() {
  try {
    console.log('> [CLM Merkl] Updating merkl campaigns...');
    const start = Date.now();
    const updates = await Promise.allSettled(getCowClmChains().map(updateChain));
    const [fulfilled, rejected] = partition(updates, isResultFulfilled);

    // Save successful chain updates
    if (fulfilled.length) {
      await campaignStore.transaction(async ({ set }) => {
        for (const {
          value: { chain, campaigns },
        } of fulfilled) {
          set(chain, campaigns);
        }
      });
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
    .then(() => updater.update())
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
  await campaignStore.load();
}

export function getCowMerklCampaignsByChain() {
  return campaignStore.toObject();
}

export function getCowMerklCampaignsForChain(chain: ApiChain) {
  return campaignStore.get(chain);
}

// only campaigns created by beefy
function isBeefyCampaign(campaign: Campaign): boolean {
  return campaign.type !== 'external';
}

export function getCowBeefyMerklCampaignsByChain() {
  return mapValues(campaignStore.toObject(), allOnChain => ({
    ...allOnChain,
    value: allOnChain.value.filter(isBeefyCampaign),
  }));
}

export function getCowBeefyMerklCampaignsForChain(chain: ApiChain) {
  const allOnChain = campaignStore.get(chain);

  if (allOnChain) {
    return {
      ...allOnChain,
      value: allOnChain.value.filter(isBeefyCampaign),
    };
  }

  return undefined;
}

/** updates merkl campaigns (if last update was more than MIN_UPDATE_INTERVAL ago) and returns campaigns that target a clm or clm pool */
export async function updateAndGetCowMerklCampaignsForChain(chain: ApiChain) {
  await updater.update();
  return getCowMerklCampaignsForChain(chain);
}
