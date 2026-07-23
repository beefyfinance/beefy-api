import type { ISwapProvider } from './ISwapProvider.ts';
import { KyberSwapProvider } from './KyberSwapProvider.ts';
import { LiquidSwapSwapProvider } from './LiquidSwapSwapProvider.ts';
import { OneInchSwapProvider } from './OneInchSwapProvider.ts';

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
