import { ChainId } from '@beefyfinance/blockchain-addressbook';
import { type ChainFeature, chainConfigs } from '../config.ts';

type AnyChainConfig = (typeof chainConfigs)[keyof typeof chainConfigs];
/** Resolved config of each enabled chain */
export type ApiChainConfig = Extract<AnyChainConfig, { status: 'active' | 'eol' }>;

/** Chains supported by the api (i.e. not disabled) */
export type ApiChain = ApiChainConfig['id'];
type FeatureChainConfig<F extends ChainFeature> = Extract<ApiChainConfig, { features: { [P in F]: true } }>;
/** Supported chains with `feature` enabled */
export type FeatureChain<F extends ChainFeature> = FeatureChainConfig<F>['id'];
export type ApyChain = FeatureChain<'apy'>;
export type ClmApiChain = FeatureChain<'clmApi'>;
export type AppChain = ApiChainConfig['appChain'];
export type AnyChain = AppChain | ApiChain;

type NumericChainId<K extends ApiChain> = `${(typeof ChainId)[K]}` extends `${infer N extends number}` ? N : never;
export type ApiChainId = { [K in ApiChain]: NumericChainId<K> }[ApiChain];

function isApiChainConfig(config: AnyChainConfig): config is ApiChainConfig {
  return config.status !== 'disabled';
}

const apiChainConfigs = Object.values(chainConfigs).filter(isApiChainConfig);

/** all enabled chains (i.e. active or eol) */
export const SupportedChains: ApiChain[] = apiChainConfigs.map(config => config.id);

function hasFeature<F extends ChainFeature>(feature: F) {
  return (config: ApiChainConfig): config is FeatureChainConfig<F> => config.features[feature];
}

/** all chains with feature `apy` enabled (default: active only) */
export const ApyChains = apiChainConfigs.filter(hasFeature('apy')).map(config => config.id);
/** all chains with feature `clmApi` enabled (default: active only) */
export const ClmApiChains = apiChainConfigs.filter(hasFeature('clmApi')).map(config => config.id);

export const ApiChainId = Object.fromEntries(SupportedChains.map(chain => [chain, ChainId[chain]])) as {
  readonly [K in ApiChain]: NumericChainId<K>;
};

export function getChainConfig(chain: ApiChain): ApiChainConfig {
  return chainConfigs[chain];
}

const supportedChainSet = new Set<string>(SupportedChains);
const chainIdToApiChain = new Map<number, ApiChain>(SupportedChains.map(chain => [ApiChainId[chain], chain]));
const appChainToApiChain = new Map<string, ApiChain>(apiChainConfigs.map(config => [config.appChain, config.id]));
const apiChainToAppChain = new Map<ApiChain, AppChain>(apiChainConfigs.map(config => [config.id, config.appChain]));

export function toAppChain(chain: AnyChain): AppChain {
  const appChain = isApiChain(chain) ? apiChainToAppChain.get(chain) : isAppChain(chain) ? chain : undefined;
  if (!appChain) {
    throw new Error(`Invalid chain: ${chain}`);
  }
  return appChain;
}

export function toApiChain(chain: AnyChain): ApiChain {
  if (isApiChain(chain)) {
    return chain;
  }

  const apiChain = appChainToApiChain.get(chain);
  if (!apiChain) {
    throw new Error(`Invalid app chain: ${chain}`);
  }
  return apiChain;
}

export function isApiChain(chain: string): chain is ApiChain {
  return supportedChainSet.has(chain);
}

export function isAppChain(chain: string): chain is AppChain {
  return appChainToApiChain.has(chain);
}

export function toChainId(chain: AnyChain): ApiChainId {
  return ApiChainId[toApiChain(chain)];
}

export function fromChainId(chainId: ApiChainId): ApiChain {
  const chain = chainIdToApiChain.get(chainId);
  if (!chain) {
    throw new Error(`Invalid chain id: ${chainId}`);
  }
  return chain;
}

export function fromChainNumber(chainId: number): ApiChain | undefined {
  return chainIdToApiChain.get(chainId);
}

/** Every address book chain, disabled included; only for serving raw beefy-v2 configs */
export type RawChain = AnyChainConfig['id'];
export type RawAppChain = AnyChainConfig['appChain'];

const rawChainConfigs: AnyChainConfig[] = Object.values(chainConfigs);

export const RawChains: RawChain[] = rawChainConfigs.map(config => config.id);

const rawChainSet = new Set<string>(RawChains);
const rawChainToAppChain = new Map<RawChain, RawAppChain>(rawChainConfigs.map(config => [config.id, config.appChain]));
const rawAppChainToChain = new Map<string, RawChain>(rawChainConfigs.map(config => [config.appChain, config.id]));
const rawChainIdToChain = new Map<number, RawChain>(RawChains.map(chain => [ChainId[chain], chain]));

export function toRawAppChain(chain: RawChain): RawAppChain {
  const appChain = rawChainToAppChain.get(chain);
  if (!appChain) {
    throw new Error(`Invalid raw chain: ${chain}`);
  }
  return appChain;
}

function isRawChain(value: string): value is RawChain {
  return rawChainSet.has(value);
}

/** chain key, app chain or numeric chain id */
export function parseRawChain(value: string): RawChain | undefined {
  if (isRawChain(value)) {
    return value;
  }
  return rawAppChainToChain.get(value) ?? (/^[0-9]+$/.test(value) ? rawChainIdToChain.get(Number(value)) : undefined);
}
