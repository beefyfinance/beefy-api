import { serviceEventBus } from '../../utils/ServiceEventBus';
import { getAllCowVaultsMeta } from './getCowVaultsMeta';
import { ApiChain } from '../../utils/chain';
import { getLoggerFor } from '../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'clm' });

type VaultCowData = Record<
  string,
  {
    currentPrice: string;
    priceRangeMin: string;
    priceRangeMax: string;
  }
>;

const chainToCowData: Partial<Record<ApiChain, VaultCowData>> = {};

async function updateCowcentratedData() {
  logger.debug('updating cow vaults price ranges');
  const start = Date.now();

  const meta = getAllCowVaultsMeta();
  let count = 0;
  for (const [chain, data] of Object.entries(meta)) {
    chainToCowData[chain as ApiChain] = data.vaults.reduce<VaultCowData>((acc, vault) => {
      acc[vault.oracleId] = {
        currentPrice: vault.currentPrice,
        priceRangeMin: vault.priceRangeMin,
        priceRangeMax: vault.priceRangeMax,
      };
      ++count;
      return acc;
    }, {} as VaultCowData);
  }

  logger.info({ count, durationMs: Date.now() - start }, 'cow vaults price ranges updated');
}

function updateAll() {
  updateCowcentratedData().catch(err => {
    logger.error({ err }, 'error updating cowcentrated price ranges');
  });
}

export function getCowPriceRanges() {
  return chainToCowData;
}

export async function initCowPriceRangeService() {
  logger.info('initializing price ranges');
  serviceEventBus.on('cowcentrated/vaults-meta/loaded', updateAll);
  serviceEventBus.on('cowcentrated/vaults-meta/updated', updateAll);
}
