import { Token } from './tokenList';

export type AddressKey<T extends Record<string, Token>> = T[keyof T]['address'];

export type AddressToTokenMap<T extends Record<string, Token>> = Record<AddressKey<T>, T[keyof T]>;

export const convertSymbolTokenMapToAddressTokenMap = <T extends Record<string, Token>>(
  symbolTokenMap: T
): AddressToTokenMap<T> => {
  const output: AddressToTokenMap<T> = {} as AddressToTokenMap<T>;
  for (const tokenSymbol in symbolTokenMap) {
    const token = symbolTokenMap[tokenSymbol];
    const address: AddressKey<T> = token.address;
    output[address] = token;
  }
  return output;
};
