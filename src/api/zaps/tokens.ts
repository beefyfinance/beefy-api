import { ChainTokens, TokenEntity, TokenErc20, TokenNative } from './types';
import { getSingleChainVaults } from '../stats/getMultichainVaults';
import { getChainBoosts } from '../boosts/getBoosts';
import { addressBook } from '../../../packages/address-book/address-book';
import Token from '../../../packages/address-book/types/token';
import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { awaitAllDebug } from '../../utils/awaitAllDebug';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { ApiChain, isApiChain } from '../../utils/chain';

const tokensByChain: Partial<Record<ApiChain, ChainTokens>> = {};

export function getTokenById(id: string, chainId: ApiChain): TokenEntity | undefined {
  const address = tokensByChain[chainId]?.byId[id];
  if (address) {
    return getTokenByAddress(address, chainId);
  }
}

export function getTokenByAddress(address: string, chainId: ApiChain): TokenEntity | undefined {
  return tokensByChain[chainId]?.byAddress[address.toLowerCase()];
}

export function getTokenNative(chainId: ApiChain): TokenNative {
  const native = getTokenById('NATIVE', chainId);
  if (!native || !isTokenNative(native)) {
    throw new Error(`No native token found for chain ${chainId}`);
  }

  return native;
}

export function getTokenWrappedNative(chainId: ApiChain): TokenErc20 {
  const wnative = getTokenById('WNATIVE', chainId);
  if (!wnative || !isTokenErc20(wnative)) {
    throw new Error(`No wnative token found for chain ${chainId}`);
  }

  return wnative;
}

export function wrappedToNative(token: TokenEntity): TokenEntity {
  const wnative = getTokenWrappedNative(token.chainId);

  if (areTokensEqual(token, wnative)) {
    return getTokenNative(token.chainId);
  }

  return token;
}

export function nativeToWrapped(token: TokenEntity): TokenErc20 {
  if (isTokenNative(token)) {
    return getTokenWrappedNative(token.chainId);
  }

  return token;
}

export function isTokenNative(token: TokenEntity): token is TokenNative {
  return token.type === 'native';
}

export function isTokenErc20(token: TokenEntity): token is TokenErc20 {
  return token.type === 'erc20';
}

export function areTokensEqual(tokenA: TokenEntity, tokenB: TokenEntity): boolean {
  return (
    tokenA.chainId === tokenB.chainId &&
    tokenA.address === tokenB.address &&
    tokenA.type === tokenB.type
  );
}

async function getVaultTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const vaults = getSingleChainVaults(chainId) || [];

  return vaults.reduce((tokens: TokenEntity[], vault) => {
    if (vault.tokenAddress) {
      tokens.push({
        type: 'erc20',
        id: vault.token,
        symbol: vault.token,
        chainId,
        oracleId: vault.oracleId,
        address: vault.tokenAddress,
        decimals: vault.tokenDecimals,
      });
    }

    if (vault.earnedTokenAddress && vault.earnedTokenAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: vault.earnedToken,
        symbol: vault.earnedToken,
        chainId,
        oracleId: vault.earnedOracleId || vault.earnedToken,
        address: vault.earnedTokenAddress,
        decimals: vault.earnedTokenDecimals || 18,
      });
    }

    return tokens;
  }, []);
}

async function getBoostTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const boosts = getChainBoosts(chainId) || [];

  return boosts.reduce((tokens: TokenEntity[], boost) => {
    if (boost.earnedTokenAddress && boost.earnedTokenAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: boost.earnedToken,
        symbol: boost.earnedToken,
        chainId,
        oracleId: boost.earnedOracleId || boost.earnedToken,
        address: boost.earnedTokenAddress,
        decimals: boost.earnedTokenDecimals || 18,
      });
    }

    return tokens;
  }, []);
}

async function getAddressTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const abTokens: Record<string, Token> = addressBook[chainId]?.tokens;
  if (!abTokens || !Object.keys(abTokens).length || !abTokens.WNATIVE) {
    console.warn(`No address book tokens found for chain ${chainId}`);
    return [];
  }

  const wnative = abTokens.WNATIVE;
  const wnativeSymbol = wnative.symbol;
  const nativeSymbol = wnativeSymbol.substring(1);

  return Object.entries(abTokens).reduce((tokens: TokenEntity[], [id, token]) => {
    if (id === nativeSymbol) {
      tokens.push({
        type: 'native',
        id,
        symbol: nativeSymbol,
        chainId,
        oracleId: token.oracleId || id,
        address: 'native',
        decimals: token.decimals,
      });

      tokens.push({
        type: 'native',
        id: 'NATIVE',
        symbol: nativeSymbol,
        chainId,
        oracleId: token.oracleId || id,
        address: 'native',
        decimals: token.decimals,
      });
    } else {
      tokens.push({
        type: 'erc20',
        id,
        symbol: token.symbol,
        chainId,
        oracleId: token.oracleId || id,
        address: token.address,
        decimals: token.decimals,
      });
    }

    return tokens;
  }, []);
}

function addToken(
  token: TokenEntity,
  byId: Record<TokenEntity['id'], TokenEntity['address']>,
  byAddress: Record<TokenEntity['address'], TokenEntity>
) {
  const addressLower = token.address.toLowerCase();

  // Map id to address
  if (byId[token.id] === undefined) {
    byId[token.id] = addressLower;
  }

  // Map address to token
  if (byAddress[addressLower] === undefined) {
    byAddress[addressLower] = token;
  }
}

async function getTokensForChain(chainId: string): Promise<ChainTokens> {
  if (!isApiChain(chainId)) {
    throw new Error(`Invalid chain ${chainId}`);
  }

  const [vaultTokens, boostTokens, abTokens] = await Promise.all([
    getVaultTokensForChain(chainId),
    getBoostTokensForChain(chainId),
    getAddressTokensForChain(chainId as keyof typeof addressBook),
  ]);

  const byId: Record<TokenEntity['id'], TokenEntity['address']> = {};
  const byAddress: Record<TokenEntity['address'], TokenEntity> = {};

  [...vaultTokens, ...boostTokens, ...abTokens].forEach(token => addToken(token, byId, byAddress));

  return { byId, byAddress };
}

export async function initTokenService() {
  // Wait for boost and vault services to be ready
  await Promise.all([
    serviceEventBus.waitForFirstEvent('vaults/updated'),
    serviceEventBus.waitForFirstEvent('boosts/updated'),
  ]);

  // Update token list
  await updateTokens();
}

async function updateTokens() {
  try {
    console.log('> Updating token service');
    const chains = Object.keys(MULTICHAIN_ENDPOINTS);
    const byChain = await Promise.all(chains.map(chainId => getTokensForChain(chainId)));

    chains.forEach((chainId, i) => {
      tokensByChain[chainId] = byChain[i];
      serviceEventBus.emit(`tokens/${chainId}/ready`);
    });

    serviceEventBus.emit('tokens/updated');

    console.log('> Token service updated');
  } catch (err) {
    console.error('> Token service update failed', err);
  }

  // Update tokens whenever boosts or vaults update
  Promise.race([
    serviceEventBus.waitForNextEvent('vaults/updated'),
    serviceEventBus.waitForNextEvent('boosts/updated'),
  ]).then(updateTokens);
}
