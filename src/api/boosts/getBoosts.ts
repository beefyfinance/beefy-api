import { getKey, setKey } from '../../utils/cache';
import { getBoostPeriodFinish, getBoosts } from './fetchBoostData';
import { Boost, BoostEntity, OldBoost, PromoTokenRewardConfig } from './types';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { contextAllSettled, isContextResultFulfilled, isContextResultRejected, withTimeout } from '../../utils/promise';
import { ApiChain, SupportedChains } from '../../utils/chain';
import { getLoggerFor } from '../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'boosts' });

const REDIS_KEY = 'BOOSTS_BY_CHAIN';

const INIT_DELAY = Number(process.env.BOOSTS_INIT_DELAY || 4 * 1000);
const REFRESH_INTERVAL = 5 * 60 * 1000;
const CACHE_SCHEMA_VERSION: number = 2; // increment when changing cache schema

type BoostsByChain = Record<string, Boost[]>;
type BoostsByChainCacheSchema = {
  version: number;
  timestamp: number;
  data: BoostsByChain;
};

let boostsByChain: BoostsByChain = {};
let allBoosts: Boost[] = [];

function convertBoostToOldFormat(boost: Boost): OldBoost {
  const tokenRewards = boost.rewards.filter((reward): reward is PromoTokenRewardConfig => reward.type === 'token');

  return {
    id: boost.id,
    name: boost.title,
    assets: boost.assets, // @deprecated
    chain: boost.chain,
    poolId: boost.vaultId,
    version: boost.version || 1,
    status: boost.status === 'inactive' ? 'closed' : boost.status || 'active',
    earnContractAddress: boost.contractAddress,
    tokenAddress: boost.tokenAddress, // @deprecated
    earnedToken: tokenRewards[0]?.symbol,
    earnedTokenDecimals: tokenRewards[0]?.decimals,
    earnedTokenAddress: tokenRewards[0]?.address,
    earnedOracle: tokenRewards[0]?.oracle || 'tokens',
    earnedOracleId: tokenRewards[0]?.oracleId,
    partners: boost.partners || [],
    partnership: !!boost.partners?.length,
    isMooStaked: true,
    periodFinish: boost.periodFinish,
    periodFinishes: boost.periodFinishes,
    campaign: boost.campaign,
  };
}

export const getAllOldBoosts = () => {
  return allBoosts.map(convertBoostToOldFormat);
};

export const getChainOldBoosts = chain => {
  return (boostsByChain[chain] || []).map(convertBoostToOldFormat);
};

export const getAllNewBoosts = () => {
  return allBoosts;
};

export const getChainNewBoosts = chain => {
  return boostsByChain[chain];
};

const updateBoosts = async () => {
  logger.debug('updating boosts');

  try {
    const start = Date.now();
    const timeout = Math.floor(REFRESH_INTERVAL / 2);
    const results = await contextAllSettled(SupportedChains, chain => withTimeout(updateChainBoosts(chain), timeout));
    const fulfilled = results.filter(isContextResultFulfilled);

    if (fulfilled.length) {
      // TODO: add TTL so entries are removed if not updated (e.g. chain rpc is down)
      buildFromChains();
      await saveToRedis();
    }

    logger.info(
      {
        chains: fulfilled.length,
        total: results.length,
        count: allBoosts.length,
        durationMs: Date.now() - start,
      },
      'boosts updated'
    );

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isContextResultRejected);
      logger.warn({ count: rejected.length }, 'chains failed to update');
      rejected.forEach(result => logger.warn({ err: result.reason, chain: result.context }, 'chain update failed'));
    }
  } catch (err) {
    logger.error({ err }, 'boost update failed');
  }

  setTimeout(updateBoosts, REFRESH_INTERVAL);
};

function buildFromChains() {
  allBoosts = Object.values(boostsByChain).flat();

  Object.keys(boostsByChain).forEach(chain => serviceEventBus.emit(`boosts/${chain}/ready`));
  serviceEventBus.emit('boosts/updated');
}

async function updateChainBoosts(chain: ApiChain) {
  const chainBoosts: BoostEntity[] = await getBoosts(chain);
  boostsByChain[chain] = await getBoostPeriodFinish(chain, chainBoosts);
}

async function loadFromRedis() {
  const cached = await getKey<BoostsByChainCacheSchema>(REDIS_KEY);

  if (
    cached &&
    typeof cached === 'object' &&
    'version' in cached &&
    'data' in cached &&
    cached.version === CACHE_SCHEMA_VERSION
  ) {
    boostsByChain = cached.data;
    buildFromChains();
  }
}

async function saveToRedis() {
  await setKey(REDIS_KEY, {
    version: CACHE_SCHEMA_VERSION,
    timestamp: Math.trunc(Date.now() / 1000),
    data: boostsByChain,
  });
}

export async function initBoostService() {
  await loadFromRedis();
  setTimeout(updateBoosts, INIT_DELAY);
}
