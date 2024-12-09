import {
  getCowVaultById,
  getMultichainClms,
  getMultichainCowVaults,
  getMultichainGovVaults,
  getMultichainVaults,
  getSingleChainCowVaults,
  getSingleChainGovVaults,
  getSingleChainVaults,
  getSingleClms,
  getVaultByID,
} from '../stats/getMultichainVaults';
import { getVaultFees } from './getVaultFees';
import { withErrorHandling } from '../../utils/koa';
import { AnyVault, HarvestableVault } from './types';
import { withChainId } from './helpers';

// Multichain

export const multichainHarvestableVaults = withErrorHandling(async ctx => {
  const multichainVaults = (getMultichainVaults() as HarvestableVault[]).concat(getMultichainCowVaults());
  ctx.status = 200;
  ctx.body = [...multichainVaults];
});

export const multichainVaults = withErrorHandling(async ctx => {
  const multichainVaults = getMultichainVaults();
  ctx.status = 200;
  ctx.body = [...multichainVaults];
});

export const multichainGovVaults = withErrorHandling(async ctx => {
  const multichainGovVaults = getMultichainGovVaults();
  ctx.status = 200;
  ctx.body = [...multichainGovVaults];
});

export const multichainCowVaults = withErrorHandling(async ctx => {
  const multichainCowVaults = getMultichainCowVaults();
  ctx.status = 200;
  ctx.body = [...multichainCowVaults];
});

export const multiChainClms = withErrorHandling(async ctx => {
  const multichainCowVaults = getMultichainClms();
  ctx.status = 200;
  ctx.body = [...multichainCowVaults];
});

// Single chain

export const singleHarvestableVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = (getSingleChainVaults(chainId) as HarvestableVault[]).concat(
    getSingleChainCowVaults(chainId)
  );
  ctx.status = 200;
  ctx.body = [...chainVaults];
});

export const singleChainVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getSingleChainVaults(chainId);
  ctx.status = 200;
  ctx.body = chainVaults ? [...chainVaults] : [];
});

export const singleGovChainVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getSingleChainGovVaults(chainId);
  ctx.status = 200;
  ctx.body = chainVaults ? [...chainVaults] : [];
});

export const singleCowChainVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getSingleChainCowVaults(chainId);
  ctx.status = 200;
  ctx.body = chainVaults ? [...chainVaults] : [];
});

export const singleChainClms = withChainId(async (ctx, chainId) => {
  const chainVaults = getSingleClms(chainId);
  ctx.status = 200;
  ctx.body = chainVaults ? [...chainVaults] : [];
});

// Single vault

export const singleVault = withErrorHandling(async ctx => {
  const vault = getVaultByID(ctx.params.vaultId);
  ctx.status = vault ? 200 : 404;
  ctx.body = vault ?? {};
});

export const singleCowVault = withErrorHandling(async ctx => {
  const vault = getCowVaultById(ctx.params.vaultId);
  ctx.status = vault ? 200 : 404;
  ctx.body = vault ?? {};
});

export const singleHarvestableVault = withErrorHandling(async ctx => {
  let vault: HarvestableVault = getVaultByID(ctx.params.vaultId);
  if (!vault) {
    vault = getCowVaultById(ctx.params.vaultId);
  }
  ctx.status = vault ? 200 : 404;
  ctx.body = vault ?? {};
});

// Other

export const vaultFees = withErrorHandling(async ctx => {
  const vaultFees = getVaultFees();
  ctx.status = 200;
  ctx.body = vaultFees;
});

export const vaultsLastHarvest = withErrorHandling(async ctx => {
  const lastHarvests = (getMultichainVaults() as AnyVault[])
    .concat(getMultichainCowVaults())
    .concat(getMultichainGovVaults())
    .reduce((res, vault) => {
      if ('lastHarvest' in vault) {
        const { id, lastHarvest } = vault;
        res[id] = lastHarvest;
      }
      return res;
    }, {});
  ctx.status = 200;
  ctx.body = lastHarvests;
});
