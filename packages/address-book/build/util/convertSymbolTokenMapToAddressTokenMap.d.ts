import type { Token } from '../types/token.js';
export type AddressToTokenMap<TBook extends Record<string, Token>> = {
    readonly [TId in keyof TBook as TBook[TId]['address']]: {
        readonly id: TId;
    } & TBook[TId];
};
export declare function convertSymbolTokenMapToAddressTokenMap<T extends Record<string, Token>>(idTokenMap: T): AddressToTokenMap<T>;
