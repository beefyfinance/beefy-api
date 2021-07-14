import type Token from '../types/token';

export type AddressToTokenMap<T extends Record<string, Token>> =
  {
  // prettier-ignore
  readonly [Obj in T[keyof T] as Obj["address"]]: Obj;
};

export function convertSymbolTokenMapToAddressTokenMap<T extends Record<string, Token>>(
  symbolTokenMap: T
): AddressToTokenMap<T> {
  return Object.fromEntries(
    Object.values<Token>(symbolTokenMap).map(t => [t.address, t])
  ) as AddressToTokenMap<T>;
}
