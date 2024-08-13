import { ProviderId } from './types';
import { AppChain } from '../../utils/chain';

export class OffchainRewardsError extends Error {
  constructor(message: string, cause?: Error) {
    super(message, cause ? { cause } : undefined);
    this.name = 'OffchainRewardsError';
  }
}

export class UnsupportedChainError extends OffchainRewardsError {
  constructor(public readonly chainId: AppChain, public readonly provider: ProviderId) {
    super(`Provider ${provider} does not support chain ${chainId}`);
    this.name = 'UnsupportedChainError';
  }
}

export class ProviderApiError extends OffchainRewardsError {
  constructor(message: string, public readonly provider: ProviderId, cause?: Error) {
    super(message, cause);
    this.name = 'ProviderApiError';
  }
}

export function isProviderApiError(err: unknown): err is ProviderApiError {
  return err && err instanceof ProviderApiError;
}
