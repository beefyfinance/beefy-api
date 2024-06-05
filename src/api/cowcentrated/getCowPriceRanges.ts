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
  const meta = getAllCowVaultsMeta();
  for (const [chain, data] of Object.entries(meta)) {
    chainToCowData[chain as ApiChain] = data.vaults.reduce<VaultCowData>((acc, vault) => {
      acc[vault.oracleId] = {
        currentPrice: vault.currentPrice,
        priceRangeMin: vault.priceRangeMin,
        priceRangeMax: vault.priceRangeMax,
      };
      return acc;
    }, {} as VaultCowData);
  }
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
