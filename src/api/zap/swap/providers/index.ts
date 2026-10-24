import { EnsoSwapProvider } from './EnsoSwapProvider.ts';
import type { ISwapProvider } from './ISwapProvider.ts';
import { KyberSwapProvider } from './KyberSwapProvider.ts';
import { LiquidSwapSwapProvider } from './LiquidSwapSwapProvider.ts';
import { OkxSwapProvider } from './OkxSwapProvider.ts';
import { OneInchSwapProvider } from './OneInchSwapProvider.ts';

export const providersById = {
  'one-inch': new OneInchSwapProvider(),
  kyber: new KyberSwapProvider(),
  'liquid-swap': new LiquidSwapSwapProvider(),
  enso: new EnsoSwapProvider(),
  okx: new OkxSwapProvider(),
} as const satisfies Record<string, ISwapProvider>;

export type ProviderId = keyof typeof providersById;

export const providers = Object.entries(providersById).map(([id, provider]) => ({
  id: id as ProviderId,
  instance: provider,
}));
