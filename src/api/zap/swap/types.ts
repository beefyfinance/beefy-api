import BigNumber from 'bignumber.js';
import { TokenErc20 } from '../../tokens/types';
import { ProviderId } from './providers';
import { ApiChain } from '../../../utils/chain';

export type TokenSupported = {
  supported: true;
  updatedAt: number;
};

export type TokenUnsupported = {
  supported: false;
  updatedAt: number;
  reason: string;
};

export type TokenSupport = TokenSupported | TokenUnsupported;

export type TokenSupportByAddress = Record<string, TokenSupport>;

export type TokenSupportByProviderByAddress = Partial<Record<ProviderId, TokenSupportByAddress>>;

export type TokenSupportByChainByProviderByAddress = Record<
  ApiChain,
  TokenSupportByProviderByAddress
>;

export type ProviderSupportByChainByAddress = Record<
  ApiChain,
  Record<string, Partial<Record<ProviderId, boolean>>>
>;

export type TokenWithPrice = {
  token: TokenErc20;
  price: number;
};

export type BuyTestToken = TokenWithPrice;

export type BuyResultSupported = {
  supported: true;
  tokenWithPrice: BuyTestToken;
  output: BigNumber;
};

export type BuyResultUnsupported = {
  supported: false;
  tokenWithPrice: BuyTestToken;
  reason: string;
};

export type BuyResult = BuyResultSupported | BuyResultUnsupported;

export function isBuyResultSupported(result: BuyResult): result is BuyResultSupported {
  return result.supported;
}

export type SellTestToken = TokenWithPrice;

export type SellResultSupported = {
  supported: true;
  tokenWithPrice: TokenWithPrice;
  output: BigNumber;
};

export type SellResultUnsupported = {
  supported: false;
  tokenWithPrice: TokenWithPrice;
  reason: string;
};

export type SellResult = SellResultSupported | SellResultUnsupported;

export function isSellResultSupported(result: SellResult): result is SellResultSupported {
  return result.supported;
}
