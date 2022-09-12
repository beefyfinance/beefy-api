import { addressBook } from '../../../packages/address-book/address-book';

const tokensByChain: Record<string, Record<string, Token>> = {};

interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

export const initTokenService = () => {
  Object.keys(addressBook).forEach(chain => {
    tokensByChain[chain] = {};

    Object.keys(addressBook[chain].tokens).forEach(tokenId => {
      const token = addressBook[chain].tokens[tokenId];
      // Prune ab fields
      tokensByChain[chain][tokenId] = {
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        decimals: token.decimals,
      };
    });
    addressBook[chain].tokens;
  });

  console.log('> Tokens initialized');
};

export const getAllTokens = () => {
  return tokensByChain;
};

export const getSingleChainTokens = (chain: string) => {
  return tokensByChain[chain] ?? [];
};
