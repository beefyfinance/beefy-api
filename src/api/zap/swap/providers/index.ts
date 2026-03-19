import { KyberSwapProvider } from './KyberSwapProvider';
import { ISwapProvider } from './ISwapProvider';
import { LiquidSwapSwapProvider } from './LiquidSwapSwapProvider.js';

export const providersById = {
  kyber: new KyberSwapProvider(),
  'liquid-swap': new LiquidSwapSwapProvider(),
} as const satisfies Record<string, ISwapProvider>;

export type ProviderId = keyof typeof providersById;

export const providers = Object.entries(providersById).map(([id, provider]) => ({
  id: id as ProviderId,
  instance: provider,
}));
