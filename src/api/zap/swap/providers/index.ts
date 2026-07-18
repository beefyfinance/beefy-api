import { OneInchSwapProvider } from './OneInchSwapProvider.ts';
import { KyberSwapProvider } from './KyberSwapProvider.ts';
import type { ISwapProvider } from './ISwapProvider.ts';
import { LiquidSwapSwapProvider } from './LiquidSwapSwapProvider.ts';

export const providersById = {
  'one-inch': new OneInchSwapProvider(),
  kyber: new KyberSwapProvider(),
  'liquid-swap': new LiquidSwapSwapProvider(),
} as const satisfies Record<string, ISwapProvider>;

export type ProviderId = keyof typeof providersById;

export const providers = Object.entries(providersById).map(([id, provider]) => ({
  id: id as ProviderId,
  instance: provider,
}));
