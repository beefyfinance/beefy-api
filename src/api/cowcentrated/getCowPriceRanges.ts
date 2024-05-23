import { serviceEventBus } from '../../utils/ServiceEventBus';
import { getAllCowVaultsMeta } from './getCowVaultsMeta';
import { ApiChain } from '../../utils/chain';

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
  console.log('> [CLM Data] Updating cow vaults price ranges...');
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

  const timing = (Date.now() - start) / 1000;
  console.log(`> [CLM Data] ${count} cow vaults price ranges updated in ${timing}s`);
}

function updateAll() {
  updateCowcentratedData().catch(err => {
    console.error('[CLM Data] Error updating cowcentrated data', err);
  });
}

export function getCowPriceRanges() {
  return chainToCowData;
}

export async function initCowDataService() {
  console.log(' > [CLM Data] Initializing...');
  serviceEventBus.on('cowcentrated/vaults-meta/loaded', updateAll);
  serviceEventBus.on('cowcentrated/vaults-meta/updated', updateAll);
}
