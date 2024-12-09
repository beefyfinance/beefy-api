import { addressBook, ChainId } from '../../packages/address-book/src/address-book';
import { invert } from 'lodash';
import chainIdMap from '../../packages/address-book/src/util/chainIdMap';

export type ApiChain = keyof typeof ChainId;
export type AppChain = Exclude<ApiChain, 'one'> | 'harmony';
export type AnyChain = AppChain | ApiChain;

const appChainToApiChain: Partial<Record<AppChain, ApiChain>> = {
  harmony: 'one',
} as const;
const apiChainToAppChain: Partial<Record<ApiChain, AppChain>> = invert(appChainToApiChain);

export const ApiChains: ApiChain[] = Object.keys(addressBook) as ApiChain[];
export const AppChains: AppChain[] = ApiChains.map(toAppChain);

export function toAppChain(chain: AnyChain): AppChain {
  if (isAppChain(chain)) {
    return chain;
  }

  if (apiChainToAppChain[chain]) {
    return apiChainToAppChain[chain];
  }

  throw new Error(`Invalid api chain: ${chain}`);
}

export function toApiChain(chain: AnyChain): ApiChain {
  if (isApiChain(chain)) {
    return chain;
  }

  if (appChainToApiChain[chain]) {
    return appChainToApiChain[chain];
  }

  throw new Error(`Invalid app chain: ${chain}`);
}

export function isApiChain(chain: string): chain is ApiChain {
  return chain in chainIdMap;
}

export function isAppChain(chain: string): chain is AppChain {
  return chain in appChainToApiChain || (chain in chainIdMap && !(chain in apiChainToAppChain));
}

export function toChainId(chain: AnyChain): number {
  const apiChain = toApiChain(chain);
  return ChainId[apiChain];
}

export function fromChainId(chainId: ChainId): ApiChain {
  return ChainId[chainId] as ApiChain;
}

export function fromChainNumber(chainId: number): ApiChain | undefined {
  const maybeApiChain = ChainId[chainId];
  if (isApiChain(maybeApiChain)) {
    return maybeApiChain;
  }

  return undefined;
}
