import { OneInchSwapProvider } from './OneInchSwapProvider';
import { KyberSwapProvider } from './KyberSwapProvider';
import { ISwapProvider } from './ISwapProvider';
import { OdosSwapProvider } from './OdosSwapProvider';

export const providersById = {
  'one-inch': new OneInchSwapProvider(),
  kyber: new KyberSwapProvider(),
  odos: new OdosSwapProvider(),
} as const satisfies Record<string, ISwapProvider>;

export type ProviderId = keyof typeof providersById;

export const providers = Object.entries(providersById).map(([id, provider]) => ({
  id: id as ProviderId,
  instance: provider,
}));
