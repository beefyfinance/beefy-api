import { Context } from 'koa';
import { ApiChain, fromChainNumber, isApiChain, isAppChain, toApiChain } from '../../utils/chain';
import { KoaCallback, sendNotFound, withErrorHandling } from '../../utils/koa';
import { AnyVault, HarvestableVault } from './types';
import { sortBy } from 'lodash';

export function getChainIdParam(ctx: Context): ApiChain | undefined {
  const raw = ctx.params.chainId;
  if (!raw) {
    return undefined;
  }

  if (isApiChain(raw)) {
    return raw;
  }

  if (isAppChain(raw)) {
    return toApiChain(raw);
  }

  const numeric = parseInt(raw, 10);
  if (isFinite(numeric) && !isNaN(numeric)) {
    return fromChainNumber(numeric);
  }

  return undefined;
}

export function withChainId(cb: (ctx: Context, chainId: ApiChain) => Promise<void>): KoaCallback {
  return withErrorHandling(async ctx => {
    const chainId = getChainIdParam(ctx);
    if (!chainId) {
      sendNotFound(ctx, 'chainId not found');
      return;
    }

    await cb(ctx, chainId);
  });
}

export function sortVaults<T extends AnyVault>(vaults: T[]): T[] {
  return sortBy(vaults, v => v.earnContractAddress.toLowerCase());
}

// @dev the object hack is to ensure that the array ends up with all the types
export const VAULT_TYPES = Object.keys({
  standard: true,
  gov: true,
  cowcentrated: true,
  erc4626: true,
} as const satisfies Record<AnyVault['type'], true>) as ReadonlyArray<AnyVault['type']>;

// @dev the object hack is to ensure that the array ends up with all the types
export const HARVESTABLE_VAULT_TYPES = Object.keys({
  standard: true,
  cowcentrated: true,
  erc4626: true,
} as const satisfies Record<HarvestableVault['type'], true>) as ReadonlyArray<HarvestableVault['type']>;
