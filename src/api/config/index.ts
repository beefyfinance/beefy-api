import type { Context } from 'koa';
import { getAllConfigs, getSingleChainConfig } from './getConfig.ts';

export const getConfigs = (ctx: Context) => {
  const allConfigs = getAllConfigs();
  ctx.status = 200;
  ctx.body = allConfigs;
};

export const getChainConfig = (ctx: Context & { params: Record<string, string> }) => {
  const chainConfigs = getSingleChainConfig(ctx.params.chainId);
  ctx.status = 200;
  ctx.body = chainConfigs;
};
