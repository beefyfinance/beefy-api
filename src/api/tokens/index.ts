import { getAllTokensByChain, getTokensForChainById } from './tokens';
import { isApiChain } from '../../utils/chain';
import { mapValues } from 'lodash';

export const getTokens = ctx => {
  const allTokens = getAllTokensByChain();
  if (allTokens) {
    ctx.status = 200;
    ctx.body = mapValues(allTokens, chainTokens =>
      mapValues(chainTokens.byId, address => chainTokens.byAddress[address])
    );
  } else {
    ctx.status = 500;
    ctx.body = 'Not available yet';
  }
};

export const getChainTokens = ctx => {
  const chainId = ctx.params.chainId;
  if (isApiChain(chainId)) {
    const chainTokens = getTokensForChainById(ctx.params.chainId);
    if (chainTokens) {
      ctx.status = 200;
      ctx.body = chainTokens;
    } else {
      ctx.status = 500;
      ctx.body = 'Not available yet';
    }
  } else {
    ctx.status = 404;
  }
};
