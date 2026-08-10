import type { Chain } from '../types/chain.js';
import type { ReadonlyRecord } from '../types/readonly-record.js';
import { ChainId, type ChainIdKey } from '../types/chainid.js';
export { ChainId };
export type { Chain };
export type { Token, TokenWithId } from '../types/token.js';
export declare const addressBook: ReadonlyRecord<ChainIdKey, Chain>;
export declare const addressBookByChainId: ReadonlyRecord<`${ChainId}`, Chain>;
