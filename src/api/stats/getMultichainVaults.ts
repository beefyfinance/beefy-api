import BigNumber from 'bignumber.js';
import {
  contextAllSettled,
  isContextResultFulfilled,
  isContextResultRejected,
  withTimeout,
} from '../../utils/promise';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { first, groupBy, mapValues, orderBy, sumBy } from 'lodash';
import { ApiChain, ApiChains } from '../../utils/chain';
import {
  AnyVault,
  ClmWithVaultPool,
  CowVault,
  GovVault,
  isVaultOfType,
  StandardVault,
  VaultOfType,
} from '../vaults/types';
import { getVaults } from '../../utils/getVaults';
import { deleteKey, getKey, setKey } from '../../utils/cache';
import { envNumber } from '../../utils/env';
import { Address } from 'viem';
import { ChainId } from '../../../packages/address-book/src/types/chainid';
import { fetchContract, getMulticallClientForChain } from '../rpc/client';
import { HARVESTABLE_VAULT_TYPES, sortVaults, VAULT_TYPES } from '../vaults/helpers';
import BeefyVaultV6Abi from '../../abis/BeefyVault';

const CACHE_KEY = 'VAULTS_BY_TYPE_CHAIN';
const CACHE_VERSION = 1;
const INIT_DELAY = envNumber('VAULTS_INIT_DELAY', 2 * 1000);
const REFRESH_INTERVAL = 5 * 60 * 1000;
const LOG_PER_CHAIN = false;

type VaultsById<T = AnyVault> = Record<string, T>;

type VaultsByChain<T = AnyVault> = Partial<Record<ApiChain, T[]>>;

type VaultsByType = {
  [K in AnyVault['type']]?: VaultOfType<K>[];
};

type VaultsByTypeChain = {
  [TType in AnyVault['type']]?: {
    [TChain in ApiChain]?: VaultOfType<TType>[];
  };
};

type StorageSchema<T> = {
  data: T;
  meta: {
    version: number;
    lastUpdate: number;
  };
};

class Storage {
  protected byTypeChain: VaultsByTypeChain = {};
  protected allVaults: AnyVault[] = [];
  protected byId: VaultsById = {};
  protected byType: VaultsByType = {};
  protected byChain: VaultsByChain = {};
  protected lastUpdate: number = 0;

  constructor(cached?: StorageSchema<VaultsByTypeChain>) {
    if (cached) {
      this.byTypeChain = cached.data;
      this.lastUpdate = cached.meta.lastUpdate;
      this.build();
    }
  }

  async save() {
    const cached: StorageSchema<VaultsByTypeChain> = {
      data: this.byTypeChain,
      meta: {
        version: CACHE_VERSION,
        lastUpdate: this.lastUpdate,
      },
    };

    await setKey(CACHE_KEY, cached);
  }

  async load(): Promise<this> {
    const cached = await getKey<StorageSchema<VaultsByTypeChain>>(CACHE_KEY);
    if (cached) {
      if (typeof cached === 'object' && cached.meta?.version === CACHE_VERSION) {
        this.setFromCache(cached);
      }
      return this;
    }

    return this.migrateFromOldSchema();
  }

  protected async migrateFromOldSchema(): Promise<this> {
    const cachedVaults = await getKey<VaultsByChain<StandardVault>>('VAULTS_BY_CHAIN');
    if (cachedVaults) {
      const cachedGovVaults = await getKey<VaultsByChain<GovVault>>('GOV_VAULTS_BY_CHAIN');
      const cachedCowVaults = await getKey<VaultsByChain<CowVault>>('COW_VAULTS_BY_CHAIN');
      const standard = cachedVaults || {};
      const gov = cachedGovVaults || {};
      const cowcentrated = cachedCowVaults || {};

      const vaultsByTypeChain: VaultsByTypeChain = {
        standard,
        gov,
        cowcentrated,
      };

      const cached = {
        data: vaultsByTypeChain,
        meta: {
          version: CACHE_VERSION,
          lastUpdate: Date.now(),
        },
      };

      this.setFromCache(cached);
      await this.save();

      await deleteKey('VAULTS_BY_CHAIN');
      await deleteKey('GOV_VAULTS_BY_CHAIN');
      await deleteKey('COW_VAULTS_BY_CHAIN');
    }

    return this;
  }

  protected setFromCache(cached: StorageSchema<VaultsByTypeChain>) {
    this.byTypeChain = cached.data;
    this.lastUpdate = cached.meta.lastUpdate;

    // BigNumbers are stored as strings
    for (const vaultsByChain of Object.values(this.byTypeChain)) {
      for (const vaults of Object.values(vaultsByChain)) {
        for (const vault of vaults) {
          if (vault.pricePerFullShare) {
            vault.pricePerFullShare = new BigNumber(vault.pricePerFullShare);
          }
        }
      }
    }

    this.build();
  }

  setTypeOfChain<T extends AnyVault['type']>(
    chain: ApiChain,
    type: T,
    vaults: VaultOfType<T>[],
    rebuild: boolean = true
  ) {
    this.byTypeChain[type] ??= {};
    (this.byTypeChain[type][chain] as VaultOfType<T>[]) = sortVaults(
      vaults.filter(v => isVaultOfType(v, type))
    );
    this.lastUpdate = Date.now();
    if (rebuild) {
      this.build();
    }
  }

  build() {
    const byId: VaultsById = {};
    const byType: VaultsByType = {};
    const byChain: VaultsByChain = {};

    this.allVaults = Object.values(this.byTypeChain)
      .flatMap(vaultsOfType => Object.values(vaultsOfType))
      .flat();

    for (const vault of this.allVaults) {
      byId[vault.id] = vault;

      byType[vault.type] ??= [];
      (byType[vault.type] as Array<typeof vault>).push(vault);

      byChain[vault.chain] ??= [];
      byChain[vault.chain].push(vault);
    }

    this.byId = byId;
    this.byType = mapValues(byType, sortVaults) as unknown as VaultsByType;
    this.byChain = mapValues(byChain, sortVaults);
  }

  getVaultById(id: string, throwIfMissing: true): AnyVault;
  getVaultById(id: string, throwIfMissing?: false): AnyVault | undefined;
  getVaultById(id: string, throwIfMissing?: boolean): AnyVault | undefined;
  getVaultById(id: string, throwIfMissing: boolean = false): AnyVault | undefined {
    const vault = this.byId[id];
    if (!vault && throwIfMissing) {
      throw new Error(`Vault with id ${id} not found`);
    }
    return vault;
  }

  getVaultByIdOfType<T extends AnyVault['type']>(
    id: string,
    type: T,
    throwIfMissingOrWrongType: true
  ): VaultOfType<T>;
  getVaultByIdOfType<T extends AnyVault['type']>(
    id: string,
    type: T,
    throwIfMissingOrWrongType?: false
  ): VaultOfType<T> | undefined;
  getVaultByIdOfType<T extends AnyVault['type']>(
    id: string,
    type: T,
    throwIfMissingOrWrongType?: boolean
  ): VaultOfType<T> | undefined;
  getVaultByIdOfType<T extends AnyVault['type']>(
    id: string,
    type: T,
    throwIfMissingOrWrongType?: boolean
  ): VaultOfType<T> | undefined {
    const vault = this.byId[id];
    if (!vault) {
      if (throwIfMissingOrWrongType) {
        throw new Error(`Vault with id ${id} not found`);
      }
      return undefined;
    }

    if (!isVaultOfType(vault, type)) {
      if (throwIfMissingOrWrongType) {
        throw new Error(`Vault with id ${id} is not of type ${type}`);
      }
      return undefined;
    }

    return vault;
  }

  getVaults(): AnyVault[] {
    return this.allVaults;
  }

  getVaultsByChain(chain: ApiChain): AnyVault[] {
    return this.byChain[chain] || [];
  }

  getVaultsByType<T extends AnyVault['type']>(type: T): VaultOfType<T>[] {
    return this.byType[type] || [];
  }

  getVaultsByTypeChain<T extends AnyVault['type']>(type: T, chain: ApiChain): VaultOfType<T>[] {
    return this.byTypeChain[type]?.[chain] || [];
  }
}

const storage = new Storage();

export const getVaultById = storage.getVaultById.bind(storage) as typeof storage.getVaultById;
export const getVaultByIdOfType = storage.getVaultByIdOfType.bind(
  storage
) as typeof storage.getVaultByIdOfType;
export const getAllVaults = storage.getVaults.bind(storage) as typeof storage.getVaults;
export const getVaultsByChain = storage.getVaultsByChain.bind(storage) as typeof storage.getVaultsByChain;
export const getVaultsByType = storage.getVaultsByType.bind(storage) as typeof storage.getVaultsByType;
export const getVaultsByTypeChain = storage.getVaultsByTypeChain.bind(
  storage
) as typeof storage.getVaultsByTypeChain;

export function getAllHarvestableVaults() {
  return sortVaults(HARVESTABLE_VAULT_TYPES.flatMap(type => getVaultsByType(type)));
}

export function getHarvestableVaultsByChain(chainId: ApiChain) {
  return sortVaults(HARVESTABLE_VAULT_TYPES.flatMap(type => getVaultsByTypeChain(type, chainId)));
}

/** @deprecated Use {@link getVaultsByType}('standard') */
export function getMultichainVaults() {
  return getVaultsByType('standard');
}

/** @deprecated Use {@link getVaultsByTypeChain}('standard', chain) */
export function getSingleChainVaults(chain: ApiChain) {
  return getVaultsByTypeChain('standard', chain);
}

/** @deprecated Use {@link getVaultsByType}('gov') */
export function getMultichainGovVaults() {
  return getVaultsByType('gov');
}

/** @deprecated Use {@link getVaultsByTypeChain}('gov', chain) */
export function getSingleChainGovVaults(chain: ApiChain) {
  return getVaultsByTypeChain('gov', chain);
}

/** @deprecated Use {@link getVaultByIdOfType}(id, 'gov') */
export function getGovVaultById(vaultId: string) {
  return getVaultByIdOfType(vaultId, 'gov');
}

/** @deprecated Use {@link getVaultsByType}('cowcentrated') */
export function getMultichainCowVaults() {
  return getVaultsByType('cowcentrated');
}

/** @deprecated Use {@link getVaultsByTypeChain}('cowcentrated', chain) */
export function getSingleChainCowVaults(chain: ApiChain) {
  return getVaultsByTypeChain('cowcentrated', chain);
}

/** @deprecated Use {@link getVaultByIdOfType}(id, 'cowcentrated') */
export function getCowVaultById(vaultId: string) {
  return getVaultByIdOfType(vaultId, 'cowcentrated');
}

/** @dev this is similar to `getVaultsByTypeAndChain('cowcentrated', chain)` but has the associated gov/standard vaults attached */
export function getSingleClms(chain: ApiChain): ClmWithVaultPool[] {
  const cowVaults = getVaultsByTypeChain('cowcentrated', chain);
  if (cowVaults.length === 0) {
    return cowVaults;
  }

  const standardVaults = getVaultsByTypeChain('standard', chain);
  const govVaults = getVaultsByTypeChain('gov', chain);
  if (standardVaults.length === 0 && govVaults.length === 0) {
    return cowVaults;
  }

  return sortVaults(
    cowVaults.map(cowVault => {
      const vault = first(
        orderBy(
          standardVaults.filter(v => v.tokenAddress === cowVault.earnedTokenAddress),
          [v => (v.status === 'active' ? 0 : v.status === 'paused' ? 1 : 2), v => v.createdAt],
          ['asc', 'desc']
        )
      );
      const pool = first(
        orderBy(
          govVaults.filter(v => v.tokenAddress === cowVault.earnedTokenAddress),
          [v => (v.status === 'active' ? 0 : v.status === 'paused' ? 1 : 2), v => v.createdAt],
          ['asc', 'desc']
        )
      );
      return {
        ...cowVault,
        vault,
        pool,
      };
    })
  );
}

/** @dev this is similar to `getVaultsByType('cowcentrated')` but has the associated gov/standard vaults attached */
export function getMultichainClms() {
  return sortVaults(ApiChains.flatMap(chain => getSingleClms(chain)));
}

type VaultHandler<T extends AnyVault> = (chain: ApiChain, vault: T, existing?: T | undefined) => Promise<T>;

type VaultTypeHandlers = {
  [T in AnyVault as T['type']]: VaultHandler<T>;
};

function keepStaleOnError<T extends AnyVault>(
  handler: VaultHandler<T>,
  keys: Array<keyof T>
): VaultHandler<T> {
  return async (chain: ApiChain, vault: T, existing: T | undefined) => {
    try {
      return await handler(chain, vault, existing);
    } catch (err) {
      if (existing && keys.every(v => !!existing[v])) {
        console.error(
          `> failed to get update ${vault.id} on ${chain}, using stale data`,
          err.shortMessage ?? err
        );
        for (const key of keys) {
          vault[key] = existing[key];
        }
        return vault;
      }

      throw err;
    }
  };
}

const vaultTypeHandlers: VaultTypeHandlers = {
  standard: keepStaleOnError(
    async (chain, vault) => {
      const [strategyAddress, pricePerFullShare] = await Promise.all([
        getStrategyAddress(chain, vault.earnContractAddress as Address),
        getPricePerFullShare(chain, vault.earnContractAddress as Address),
      ]);
      vault.strategy = strategyAddress;
      vault.pricePerFullShare = pricePerFullShare;
      vault.lastHarvest = await getLastHarvest(chain, vault.strategy as Address);
      return vault;
    },
    ['strategy', 'pricePerFullShare', 'lastHarvest']
  ),
  gov: keepStaleOnError(
    async (chain, vault) => {
      vault.totalSupply = await getTotalSupply(chain, vault.earnContractAddress as Address);
      return vault;
    },
    ['totalSupply']
  ),
  cowcentrated: keepStaleOnError(
    async (chain, vault) => {
      vault.strategy = await getStrategyAddress(chain, vault.earnContractAddress as Address);
      vault.lastHarvest = await getLastHarvest(chain, vault.strategy as Address);
      return vault;
    },
    ['strategy', 'lastHarvest']
  ),
  erc4626: keepStaleOnError(
    async (chain, vault) => {
      vault.strategy = vault.earnContractAddress;
      const [pricePerFullShare, lastHarvest] = await Promise.all([
        getPricePerFullShare(chain, vault.earnContractAddress as Address),
        getLastHarvest(chain, vault.strategy as Address),
      ]);
      vault.pricePerFullShare = pricePerFullShare;
      vault.lastHarvest = lastHarvest;
      return vault;
    },
    ['strategy', 'pricePerFullShare', 'lastHarvest']
  ),
};

async function getStrategyAddress(chain: ApiChain, vaultAddress: Address): Promise<Address> {
  const chainId = ChainId[chain];
  const vaultContract = fetchContract(vaultAddress, BeefyVaultV6Abi, chainId);
  const strategyAddress = await vaultContract.read.strategy();
  return strategyAddress;
}

async function getPricePerFullShare(chain: ApiChain, vaultAddress: Address): Promise<BigNumber> {
  const chainId = ChainId[chain];
  const vaultContract = fetchContract(vaultAddress, BeefyVaultV6Abi, chainId);
  const result = await vaultContract.read.getPricePerFullShare();
  const ppfs = new BigNumber(result.toString(10));
  return ppfs;
}

async function getLastHarvest(chain: ApiChain, strategyAddress: Address): Promise<number> {
  const chainId = ChainId[chain];
  try {
    const vaultContract = fetchContract(
      strategyAddress,
      [
        {
          inputs: [],
          name: 'lastHarvest',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const,
      chainId
    );
    const result = await vaultContract.read.lastHarvest();
    return Number(result.toString(10));
  } catch (err) {
    // console.error(`> failed to get lastHarvest for ${strategyAddress} on ${chain}`, err);
    return 0;
  }
}

async function getTotalSupply(chain: ApiChain, vaultAddress: Address): Promise<number> {
  const chainId = ChainId[chain];
  const vaultContract = fetchContract(vaultAddress, BeefyVaultV6Abi, chainId);
  const totalSupply = await vaultContract.read.totalSupply();
  return Number(totalSupply.toString(10));
}

/** update all vaults of a specific chain */
async function updateChainVaults(chain: ApiChain) {
  if (LOG_PER_CHAIN) {
    console.log(`> updating vaults on ${chain}`);
  }

  // get all vaults from git .json
  const allVaults = await getVaults(chain);

  // add on-chain data
  const processedVaults = await Promise.all(
    allVaults.map(async vault => {
      const handler = vaultTypeHandlers[vault.type] as VaultHandler<AnyVault>;
      try {
        const existing = storage.getVaultByIdOfType(vault.id, vault.type);
        return await handler(chain, vault, existing);
      } catch (err) {
        console.error(`> failed to process vault ${vault.id} on ${chain}`, err);
        return vault;
      }
    })
  );

  // group by type
  const byType = groupBy(processedVaults, v => v.type) as VaultsByType;

  // copy last harvests from CLMs to CLM Pools
  const cowVaults = byType.cowcentrated || [];
  for (const cowVault of cowVaults) {
    const govVaults = byType.gov || [];
    const clmPools = govVaults.filter(v => v.tokenAddress === cowVault.earnedTokenAddress);
    for (const clmPool of clmPools) {
      clmPool.lastHarvest = cowVault.lastHarvest;
    }
  }

  for (const vaultType of VAULT_TYPES) {
    const vaults = byType[vaultType] || [];
    storage.setTypeOfChain(chain, vaultType, vaults, false); // don't rebuild indexes, we will do it after all chains complete
  }

  if (LOG_PER_CHAIN) {
    console.log(`> updated ${processedVaults.length} vaults on ${chain}`);
  }
}

/** update all vaults on all chains */
async function updateMultichainVaults() {
  console.log('> updating vaults');

  try {
    const start = Date.now();
    const timeout = Math.min(30_000, REFRESH_INTERVAL / 2);
    const results = await contextAllSettled(ApiChains, chain =>
      withTimeout(updateChainVaults(chain), timeout)
    );
    const fulfilled = results.filter(isContextResultFulfilled);

    if (fulfilled.length) {
      // TODO: add TTL so entries are removed if not updated (e.g. chain rpc is down)
      storage.build();
      await storage.save();
      serviceEventBus.emit('vaults/updated');
    }

    const activeIdsCounter = sumBy(storage.getVaults(), vault => (vault.status === 'active' ? 1 : 0));

    console.log(
      `> Vaults for ${fulfilled.length}/${results.length} chains updated: ${
        storage.getVaults().length
      } vaults (${activeIdsCounter} active) (${(Date.now() - start) / 1000}s)`
    );

    if (fulfilled.length < results.length) {
      const rejected = results.filter(isContextResultRejected);
      console.error(` - ${rejected.length} chains failed to update:`);
      rejected.forEach(result => console.error(`  - ${result.context}`, result.reason));
    }
  } catch (err) {
    console.error(`> vaults update failed `, err);
  }

  setTimeout(updateMultichainVaults, REFRESH_INTERVAL);
}

export async function initVaultService() {
  await storage.load();
  setTimeout(updateMultichainVaults, INIT_DELAY);
}
