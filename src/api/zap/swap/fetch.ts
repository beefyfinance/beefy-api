import { ApiChain } from '../../../utils/chain';
import { ProviderId, providers, providersById } from './providers';
import { getAmmAllPrices } from '../../stats/getAmmPrices';
import {
  getTokenById,
  getTokenNative,
  getTokenWrappedNative,
  isTokenErc20,
} from '../../tokens/tokens';
import { isFiniteNumber } from '../../../utils/number';
import { partition, uniqBy } from 'lodash';
import { TokenEntity, TokenErc20 } from '../../tokens/types';
import { ISwapProvider } from './providers/ISwapProvider';
import { getSingleChainVaults } from '../../stats/getMultichainVaults';
import {
  BuyTestToken,
  isBuyResultSupported,
  isSellResultSupported,
  TokenSupportByAddress,
  SellTestToken,
} from './types';
import { checkBuy } from './buy';
import { checkSell } from './sell';
import { redactSecrets } from '../../../utils/secrets';
import { blockedTokensByChain } from './blocked-tokens';

async function getTokensForChain(apiChain: ApiChain): Promise<TokenErc20[]> {
  const vaults = getSingleChainVaults(apiChain);
  if (!vaults || !vaults.length) {
    return [];
  }

  const tokens = vaults.reduce((acc, vault) => {
    if (vault.assets && vault.assets.length) {
      for (const assetId of vault.assets) {
        const assetToken = getTokenById(assetId, apiChain);
        if (assetToken) {
          acc.push(assetToken);
        }
      }
    }

    return acc;
  }, [] as TokenEntity[]);

  const uniqueTokens = uniqBy(tokens, 'address').filter(isTokenErc20);
  const blockedTokens = blockedTokensByChain[apiChain];
  if (blockedTokens && blockedTokens.size) {
    return uniqueTokens.filter(token => !blockedTokens.has(token.address));
  }

  return uniqueTokens;
}

function markTokensUnsupported(
  byAddress: TokenSupportByAddress,
  tokens: TokenEntity[],
  reason: string
) {
  const updatedAt = Date.now();
  for (const token of tokens) {
    byAddress[token.address] = {
      supported: false,
      updatedAt,
      reason: redactSecrets(reason),
    };
  }
  return byAddress;
}

function markTokensSupported(byAddress: TokenSupportByAddress, tokens: TokenEntity[]) {
  const updatedAt = Date.now();
  for (const token of tokens) {
    byAddress[token.address] = {
      supported: true,
      updatedAt,
    };
  }
  return byAddress;
}

function markTokenUnsupported(
  byAddress: TokenSupportByAddress,
  token: TokenEntity,
  reason: string
) {
  byAddress[token.address] = {
    supported: false,
    updatedAt: Date.now(),
    reason: redactSecrets(reason),
  };
  return byAddress;
}

function markTokenSupported(byAddress: TokenSupportByAddress, token: TokenEntity) {
  byAddress[token.address] = {
    supported: true,
    updatedAt: Date.now(),
  };
  return byAddress;
}

function getProviderForChain(
  providerKey: ProviderId,
  apiChain: ApiChain
): ISwapProvider | undefined {
  const provider = providersById[providerKey];
  if (!provider) {
    return undefined;
  }

  if (!provider.supportsChain(apiChain)) {
    return undefined;
  }

  return provider;
}

export function getProvidersForChain(apiChain: ApiChain): ProviderId[] {
  return providers.filter(({ instance }) => instance.supportsChain(apiChain)).map(({ id }) => id);
}

export async function fetchProviderSupportForChainTokens(
  providerKey: ProviderId,
  apiChain: ApiChain,
  maxPriceImpact: number,
  checkAmount: number
): Promise<TokenSupportByAddress> {
  const minOutputRatio = 1 - maxPriceImpact;
  const supportByAddress: TokenSupportByAddress = {};

  // Get tokens for chain
  const allTokens = await getTokensForChain(apiChain);
  if (allTokens.length === 0) {
    console.warn(`> [Zap] No tokens found for chain ${apiChain}, skipping...`);
    return supportByAddress;
  }

  // Check provider exists
  const provider = getProviderForChain(providerKey, apiChain);
  if (!provider) {
    return markTokensUnsupported(
      supportByAddress,
      allTokens,
      `Provider ${providerKey} does not support chain ${apiChain}`
    );
  }

  const beefyPrices = await getAmmAllPrices();
  const native = getTokenNative(apiChain);
  const wnative = getTokenWrappedNative(apiChain);
  const wnativePrice = beefyPrices[wnative.oracleId];
  if (!isFiniteNumber(wnativePrice) || wnativePrice <= 0) {
    return markTokensUnsupported(
      supportByAddress,
      allTokens,
      `Invalid wnative price via oracle ${wnative.oracleId} on chain ${apiChain}`
    );
  }

  // We assume native and wnative are always supported
  const tokensToCheck = allTokens.filter(token => token.address !== wnative.address);
  markTokensSupported(supportByAddress, [native, wnative]);

  // Check tokens have a price
  const wnativeWithPrice = { token: wnative, price: wnativePrice };
  const tokenPrices: (number | undefined)[] = tokensToCheck.map(token =>
    token.oracleId && isFiniteNumber(beefyPrices[token.oracleId]) && beefyPrices[token.oracleId] > 0
      ? beefyPrices[token.oracleId]
      : undefined
  );

  const buyTestTokens: BuyTestToken[] = tokensToCheck.reduce((acc, token, index) => {
    if (tokenPrices[index] !== undefined) {
      acc.push({
        token,
        price: tokenPrices[index]!,
      });
    } else {
      markTokenUnsupported(
        supportByAddress,
        token,
        `Token ${token.symbol} does not have a price via oracle ${token.oracleId}`
      );
    }

    return acc;
  }, [] as BuyTestToken[]);

  // Check we can buy token for native
  const buyResults = await checkBuy(
    provider,
    providerKey,
    apiChain,
    wnativeWithPrice,
    buyTestTokens,
    checkAmount,
    minOutputRatio
  );
  const [buySupported, buyUnsupported] = partition(buyResults, isBuyResultSupported);

  buyUnsupported.forEach(({ reason, tokenWithPrice }, i) =>
    markTokenUnsupported(supportByAddress, tokenWithPrice.token, reason)
  );

  // Check we can sell token to native
  const sellTestTokens: SellTestToken[] = buySupported.map(({ tokenWithPrice }) => tokenWithPrice);
  const sellResults = await checkSell(
    provider,
    providerKey,
    apiChain,
    wnativeWithPrice,
    sellTestTokens,
    checkAmount,
    minOutputRatio
  );
  const [sellSupported, sellUnsupported] = partition(sellResults, isSellResultSupported);

  sellUnsupported.forEach(({ reason, tokenWithPrice }, i) =>
    markTokenUnsupported(supportByAddress, tokenWithPrice.token, reason)
  );
  sellSupported.forEach(({ tokenWithPrice }) =>
    markTokenSupported(supportByAddress, tokenWithPrice.token)
  );

  return supportByAddress;
}
