import { addressBook } from '../../../packages/address-book/address-book';
import Token from '../../../packages/address-book/types/token';

const tokensByChain: Record<string, Record<string, Token>> = {};

export const initTokenService = () => {
  Object.keys(addressBook).forEach(chain => {
    tokensByChain[chain] = addressBook[chain].tokens;
  });

  console.log('> Tokens initialized');
};

export const getAllTokens = () => {
  return tokensByChain;
};

export const getSingleChainTokens = (chain: string) => {
  return tokensByChain[chain] ?? [];
};
