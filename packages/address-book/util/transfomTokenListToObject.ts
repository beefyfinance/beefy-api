import type Token from '../types/token';
import { TokenList } from './tokenList';

const transformTokenListToObject = (
  tokenList: TokenList,
  chainIdFilter?: number
): Record<string, Token> => {
  const map: Record<string, Token> = {};
  tokenList.tokens.forEach(token => {
    if ((chainIdFilter && token.chainId === chainIdFilter) || !chainIdFilter) {
      const { symbol } = token;
      if (symbol in map) {
        const { address } = map[symbol];
        if (address.toLowerCase() !== token.address.toLowerCase()) {
          // same symbol, but different address.
          map[`${token.symbol}-${token.name}`] = token;
        }
      } else {
        map[symbol] = token;
      }
    }
  });
  return map;
};

export default transformTokenListToObject;
