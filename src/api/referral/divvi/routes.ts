import Koa from 'koa';
import type { DivviSubmitRequest } from './types.js';
import { sendBadRequest, sendSuccess } from '../../../utils/koa.js';
import { fromChainNumber } from '../../../utils/chain.js';
import { getDivviApi } from './api.js';

function isDivviSubmitRequest(body: unknown): body is DivviSubmitRequest {
  return (
    typeof body === 'object' &&
    body !== null &&
    'chainId' in body &&
    typeof (body as DivviSubmitRequest).chainId === 'number' &&
    'hash' in body &&
    typeof (body as DivviSubmitRequest).hash === 'string'
  );
}

function isValidChainId(chainId: number): boolean {
  if (isFinite(chainId) && !isNaN(chainId)) {
    return fromChainNumber(chainId) !== undefined;
  }
  return false;
}

export async function submitDivvi(ctx: Koa.Context) {
  const request = ctx.request['body'];
  if (!isDivviSubmitRequest(request)) {
    sendBadRequest(ctx, { error: 'Invalid request body' });
    return;
  }
  const { chainId, hash } = request;
  if (!isValidChainId(chainId)) {
    sendBadRequest(ctx, { error: `Invalid chainId: ${chainId}` });
    return;
  }
  const api = getDivviApi();
  const result = await api.submit(chainId, hash);
  sendSuccess(ctx, { status: result });
}
