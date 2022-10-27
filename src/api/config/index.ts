import { getAllConfigs, getSingleChainConfig } from './getConfig';

export const getConfigs = ctx => {
  const allConfigs = getAllConfigs();
  ctx.status = 200;
  ctx.body = allConfigs;
};

export const getChainConfig = ctx => {
  const chainConfigs = getSingleChainConfig(ctx.params.chainId);
  ctx.status = 200;
  ctx.body = chainConfigs;
};
