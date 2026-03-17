import {
  getAllTokensByChain,
  getTokenById,
  getTokenFees,
  getTokenNative,
  getTokensForChainById,
  getTokenWrappedNative,
} from './tokens';
import { isApiChain } from '../../utils/chain';
import { mapValues } from 'lodash';
import {
  sendInternalServerError,
  sendNotFound,
  sendServiceUnavailable,
  sendSuccess,
  withErrorHandling,
} from '../../utils/koa';
import { withChainId } from '../vaults/helpers';

export const getTokens = withErrorHandling(async ctx => {
  const allTokens = getAllTokensByChain();
  if (allTokens) {
    sendSuccess(
      ctx,
      mapValues(allTokens, chainTokens =>
        mapValues(chainTokens.byId, address => chainTokens.byAddress[address])
      )
    );
  } else {
    sendServiceUnavailable(ctx, { error: 'Tokens not available yet' });
  }
});

export const getChainTokens = withChainId(async (ctx, chainId) => {
  const chainTokens = getTokensForChainById(chainId);
  if (chainTokens) {
    sendSuccess(ctx, chainTokens);
  } else {
    sendServiceUnavailable(ctx, { error: 'Tokens not available yet for this chain' });
  }
});

export const getChainToken = withChainId(async (ctx, chainId) => {
  const token = getTokenById(ctx.params.tokenId, chainId);
  if (token) {
    sendSuccess(ctx, token);
  } else {
    sendNotFound(ctx, { error: 'Token not found' });
  }
});

export const getChainNatives = withChainId(async (ctx, chainId) => {
  const native = getTokenNative(chainId);
  const wrapped = getTokenWrappedNative(chainId);
  const fees = getTokenFees(chainId);
  if (native || wrapped) {
    sendSuccess(ctx, { NATIVE: native, WNATIVE: wrapped, FEES: fees });
  } else {
    sendInternalServerError(ctx, { error: 'Native token not found for this chain' });
  }
});

export const getNativesFromAllChains = withErrorHandling(async ctx => {
  const natives = {};
  Object.keys(getAllTokensByChain()).forEach(chainId => {
    if (isApiChain(chainId)) {
      const native = getTokenNative(chainId);
      const wrapped = getTokenWrappedNative(chainId);
      const fees = getTokenFees(chainId);

      natives[chainId] = { NATIVE: native, WNATIVE: wrapped, FEES: fees };
    }
  });
  if (Object.keys(natives).length) {
    sendSuccess(ctx, natives);
  } else {
    sendServiceUnavailable(ctx, { error: 'Native tokens not available yet' });
  }
});
