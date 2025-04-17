import {
  getAllHarvestableVaults,
  getAllVaults,
  getHarvestableVaultsByChain,
  getMultichainClms,
  getSingleClms,
  getVaultById,
  getVaultsByChain,
  getVaultsByType,
  getVaultsByTypeChain,
} from '../stats/getMultichainVaults';
import { getVaultFees } from './getVaultFees';
import { sendBadRequest, sendNotFound, sendSuccess, withErrorHandling } from '../../utils/koa';
import { withChainId } from './helpers';

// Multichain

export const multichainHarvestableVaults = withErrorHandling(async ctx => {
  const multichainVaults = getAllHarvestableVaults();
  sendSuccess(ctx, multichainVaults);
});

export const multichainAllVaults = withErrorHandling(async ctx => {
  const multichainVaults = getAllVaults();
  sendSuccess(ctx, multichainVaults);
});

export const multichainStandardVaults = withErrorHandling(async ctx => {
  const multichainVaults = getVaultsByType('standard');
  sendSuccess(ctx, multichainVaults);
});

export const multichainGovVaults = withErrorHandling(async ctx => {
  const multichainVaults = getVaultsByType('gov');
  sendSuccess(ctx, multichainVaults);
});

export const multichainCowVaults = withErrorHandling(async ctx => {
  const multichainVaults = getVaultsByType('cowcentrated');
  sendSuccess(ctx, multichainVaults);
});

export const multiChainClms = withErrorHandling(async ctx => {
  const multichainCowVaults = getMultichainClms();
  sendSuccess(ctx, multichainCowVaults);
});

// Single chain

export const singleChainHarvestableVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getHarvestableVaultsByChain(chainId);
  sendSuccess(ctx, chainVaults);
});

export const singleChainAllVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getVaultsByChain(chainId);
  sendSuccess(ctx, chainVaults);
});

export const singleChainStandardVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getVaultsByTypeChain('standard', chainId);
  sendSuccess(ctx, chainVaults);
});

export const singleChainGovVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getVaultsByTypeChain('gov', chainId);
  sendSuccess(ctx, chainVaults);
});

export const singleChainCowVaults = withChainId(async (ctx, chainId) => {
  const chainVaults = getVaultsByTypeChain('cowcentrated', chainId);
  sendSuccess(ctx, chainVaults);
});

export const singleChainClms = withChainId(async (ctx, chainId) => {
  const chainVaults = getSingleClms(chainId);
  sendSuccess(ctx, chainVaults);
});

// Single vault

export const singleVault = withErrorHandling(async ctx => {
  const vaultId = ctx.params.vaultId;
  if (typeof vaultId !== 'string' || vaultId.length === 0) {
    sendBadRequest(ctx, { error: 'Missing vaultId parameter' });
    return;
  }

  const vault = getVaultById(vaultId);
  if (!vault) {
    sendNotFound(ctx, { error: `Vault with id ${vaultId} not found` });
    return;
  }

  if (vault.type !== 'standard') {
    sendBadRequest(ctx, { error: `Vault with id ${vaultId} is not a standard vault` });
    return;
  }

  sendSuccess(ctx, vault);
});

export const singleGovVault = withErrorHandling(async ctx => {
  const vaultId = ctx.params.vaultId;
  if (typeof vaultId !== 'string' || vaultId.length === 0) {
    sendBadRequest(ctx, { error: 'Missing vaultId parameter' });
    return;
  }

  const vault = getVaultById(vaultId);
  if (!vault) {
    sendNotFound(ctx, { error: `Vault with id ${vaultId} not found` });
    return;
  }

  if (vault.type !== 'gov') {
    sendBadRequest(ctx, { error: `Vault with id ${vaultId} is not a gov vault` });
    return;
  }

  sendSuccess(ctx, vault);
});

export const singleCowVault = withErrorHandling(async ctx => {
  const vaultId = ctx.params.vaultId;
  if (typeof vaultId !== 'string' || vaultId.length === 0) {
    sendBadRequest(ctx, { error: 'Missing vaultId parameter' });
    return;
  }

  const vault = getVaultById(vaultId);
  if (!vault) {
    sendNotFound(ctx, { error: `Vault with id ${vaultId} not found` });
    return;
  }

  if (vault.type !== 'cowcentrated') {
    sendBadRequest(ctx, { error: `Vault with id ${vaultId} is not a cowcentrated vault` });
    return;
  }

  sendSuccess(ctx, vault);
});

export const singleHarvestableVault = withErrorHandling(async ctx => {
  const vaultId = ctx.params.vaultId;
  if (typeof vaultId !== 'string' || vaultId.length === 0) {
    sendBadRequest(ctx, { error: 'Missing vaultId parameter' });
    return;
  }

  const vault = getVaultById(vaultId);
  if (!vault) {
    sendNotFound(ctx, { error: `Vault with id ${vaultId} not found` });
    return;
  }

  if (!['standard', 'cowcentrated', 'erc4624'].includes(vault.type)) {
    sendBadRequest(ctx, { error: `Vault with id ${vaultId} is not harvestable` });
    return;
  }

  sendSuccess(ctx, vault);
});

export const singleAnyVault = withErrorHandling(async ctx => {
  const vaultId = ctx.params.vaultId;
  if (typeof vaultId !== 'string' || vaultId.length === 0) {
    sendBadRequest(ctx, { error: 'Missing vaultId parameter' });
    return;
  }

  const vault = getVaultById(vaultId);
  if (!vault) {
    sendNotFound(ctx, { error: `Vault with id ${vaultId} not found` });
    return;
  }

  sendSuccess(ctx, vault);
});

// Other

export const vaultFees = withErrorHandling(async ctx => {
  const vaultFees = getVaultFees();
  ctx.status = 200;
  ctx.body = vaultFees;
});

export const vaultsLastHarvest = withErrorHandling(async ctx => {
  const lastHarvests = getAllVaults().reduce((res, vault) => {
    if ('lastHarvest' in vault) {
      const { id, lastHarvest } = vault;
      if (lastHarvest) {
        res[id] = lastHarvest;
      }
    }
    return res;
  }, {} as Record<string, number>);
  ctx.status = 200;
  ctx.body = lastHarvests;
});
