import BigNumber from 'bignumber.js';

/**
 * Override configuration for vaults with incorrect on-chain values.
 * These vaults had their underlying platforms exploited, causing balance()
 * and getPricePerFullShare() to return incorrect values.
 * We override them with the last known correct values from before the incident.
 */

export interface VaultOverride {
  /** Balance in native token decimals (e.g., 1e6 for USDC) */
  readonly balance: string;
  /** PricePerFullShare in 1e18 decimals */
  readonly pricePerFullShare: string;
  readonly reason: string;
}

/**
 * Registry of vault overrides.
 * All values are the last known correct values BEFORE the incident.
 */
const vaultOverridesData: Record<string, VaultOverride> = {
  'silov2-avalanche-ausd-valamore': {
    balance: '492153165795', // 492153.165795 * 1e6
    pricePerFullShare: '1518690926181063910', // 1.51869092618106391 * 1e18
    reason: 'Stream exploit',
  },
  'silov2-avalanche-usdt-valamore': {
    balance: '2251698412379', // 2251698.412379 * 1e6
    pricePerFullShare: '1518986904932948066', // 1.518986904932948066 * 1e18
    reason: 'Stream exploit',
  },
  'silov2-avalanche-usdc-mev': {
    balance: '3049903089584', // 3049903.089584 * 1e6
    pricePerFullShare: '1490148745133000150', // 1.49014874513300015 * 1e18
    reason: 'Stream exploit',
  },
  'silov2-arbitrum-usdc-valamore': {
    balance: '11591864596129', // 11591864.596129 * 1e6
    pricePerFullShare: '1468794706954620224', // 1.468794706954620224 * 1e18
    reason: 'Stream exploit',
  },
};

/** Immutable Map for O(1) lookup of vault overrides by vault ID */
export const VAULT_OVERRIDES: ReadonlyMap<string, Readonly<VaultOverride>> = new Map(
  Object.entries(vaultOverridesData)
);

/** Set of overridden vault IDs for quick membership checks */
export const OVERRIDDEN_VAULT_IDS: ReadonlySet<string> = new Set(Object.keys(vaultOverridesData));

/**
 * Get the balance override for a vault.
 * @returns BigNumber balance if vault has an override, undefined otherwise
 */
export function getVaultBalanceOverride(vaultId: string): BigNumber | undefined {
  const override = VAULT_OVERRIDES.get(vaultId);
  if (override) {
    return new BigNumber(override.balance);
  }
  return undefined;
}

/**
 * Get the pricePerFullShare override for a vault.
 * @returns BigNumber PPFS if vault has an override, undefined otherwise
 */
export function getVaultPpfsOverride(vaultId: string): BigNumber | undefined {
  const override = VAULT_OVERRIDES.get(vaultId);
  if (override) {
    return new BigNumber(override.pricePerFullShare);
  }
  return undefined;
}

/**
 * Check if a vault has an override.
 */
export function hasVaultOverride(vaultId: string): boolean {
  return OVERRIDDEN_VAULT_IDS.has(vaultId);
}
