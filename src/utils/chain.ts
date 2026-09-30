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

export type ApiChainId = (typeof ChainId)[ApiChain];

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
  readonly [K in ApiChain]: (typeof ChainId)[K];
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
