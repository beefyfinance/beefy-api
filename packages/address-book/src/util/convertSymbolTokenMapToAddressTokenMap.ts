import type { Token, TokenWithId } from '../types/token.js';

export type AddressToTokenMap<TBook extends Record<string, Token>> = {
  readonly [TId in keyof TBook as TBook[TId]['address']]: { readonly id: TId } & TBook[TId];
};

export function convertSymbolTokenMapToAddressTokenMap<T extends Record<string, Token>>(
  idTokenMap: T
): AddressToTokenMap<T> {
  const addressToId = Object.keys(idTokenMap).reduce(
    (acc, id) => {
      acc[idTokenMap[id].address] = id;
      return acc;
    },
    {} as Record<string, string | TokenWithId>
  );

  return new Proxy(addressToId, {
    get(_, address: string): TokenWithId | undefined {
      const idOrToken = addressToId[address];
      if (!idOrToken) {
        return undefined;
      }

      if (typeof idOrToken === 'string') {
        return (addressToId[address] = { id: idOrToken, ...idTokenMap[idOrToken] });
      }

      return idOrToken;
    },
  }) as unknown as AddressToTokenMap<T>;
}
