import { getSingleChainVaults } from '../stats/getMultichainVaults';
import { getChainBoosts } from '../boosts/getBoosts';
import { addressBook } from '../../../packages/address-book/address-book';
import Token from '../../../packages/address-book/types/token';
import { MULTICHAIN_ENDPOINTS } from '../../constants';
import { serviceEventBus } from '../../utils/ServiceEventBus';
import { ApiChain, isApiChain } from '../../utils/chain';
import { ChainTokens, TokenEntity, TokenErc20, TokenNative, TokensByChain } from './types';
import { mapValues } from 'lodash';
import { getAddress } from 'viem';

const tokensByChain: Partial<TokensByChain> = {};

export function getTokenById(id: string, chainId: ApiChain): TokenEntity | undefined {
  const address = tokensByChain[chainId]?.byId[id];
  if (address) {
    return getTokenByAddress(address, chainId);
  }
}

export function getTokenByAddress(address: string, chainId: ApiChain): TokenEntity | undefined {
  return tokensByChain[chainId]?.byAddress[address.toLowerCase()];
}

export function getTokensForChain(chainId: ApiChain): Record<string, TokenEntity> {
  return tokensByChain[chainId]?.byAddress || {};
}

export function getTokensForChainById(chainId: ApiChain): Record<string, TokenEntity> | undefined {
  const idMap = tokensByChain[chainId]?.byId;
  if (idMap) {
    return mapValues(idMap, address => getTokenByAddress(address, chainId));
  }
}

export function getAllTokensByChain(): Partial<TokensByChain> {
  return tokensByChain;
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

async function fetchVaultTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const vaults = getSingleChainVaults(chainId) || [];

  return vaults.reduce((tokens: TokenEntity[], vault) => {
    // Native comes from address book
    if (vault.tokenAddress && vault.tokenAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: vault.token,
        symbol: vault.token,
        name: vault.token,
        chainId,
        oracle: vault.oracle,
        oracleId: vault.oracleId,
        address: vault.tokenAddress,
        decimals: vault.tokenDecimals,
      });
    }

    // Skip natives and mooTokens
    if (
      vault.earnedTokenAddress &&
      vault.earnedTokenAddress !== 'native' &&
      vault.earnedTokenAddress !== vault.earnContractAddress
    ) {
      tokens.push({
        type: 'erc20',
        id: vault.earnedToken,
        symbol: vault.earnedToken,
        name: vault.earnedToken,
        chainId,
        oracle: 'tokens', // ???
        oracleId: vault.earnedOracleId || vault.earnedToken,
        address: vault.earnedTokenAddress,
        decimals: vault.earnedTokenDecimals || 18,
      });
    }

    return tokens;
  }, []);
}

async function fetchBoostTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const boosts = getChainBoosts(chainId) || [];
  const vaultAddresses = new Set(
    (getSingleChainVaults(chainId) || []).map(vault => vault.earnContractAddress)
  );

  return boosts.reduce((tokens: TokenEntity[], boost) => {
    if (
      boost.earnedTokenAddress &&
      boost.earnedTokenAddress !== 'native' &&
      !vaultAddresses.has(boost.earnedTokenAddress)
    ) {
      tokens.push({
        type: 'erc20',
        id: boost.earnedToken,
        symbol: boost.earnedToken,
        name: boost.earnedToken,
        chainId,
        oracleId: boost.earnedOracleId || boost.earnedToken,
        oracle: boost.earnedOracle,
        address: boost.earnedTokenAddress,
        decimals: boost.earnedTokenDecimals || 18,
      });
    }

    return tokens;
  }, []);
}

async function fetchAddressBookTokensForChain(chainId: ApiChain): Promise<TokenEntity[]> {
  const abTokens: Record<string, Token> = addressBook[chainId]?.tokens;
  if (!abTokens || !Object.keys(abTokens).length || !abTokens.WNATIVE) {
    console.warn(`No address book tokens found for chain ${chainId}`);
    return [];
  }

  const wnative = abTokens.WNATIVE;
  const wnativeSymbol = wnative.symbol;
  const nativeSymbol = wnativeSymbol.substring(1);

  return Object.entries(abTokens).reduce((tokens: TokenEntity[], [id, token]) => {
    if (id.toLowerCase() === nativeSymbol.toLowerCase()) {
      tokens.push({
        type: 'native',
        id,
        symbol: id,
        name: token.name,
        chainId,
        oracle: token.oracle || 'tokens',
        oracleId: token.oracleId || id,
        address: 'native',
        decimals: token.decimals,
        ...(token.bridge ? { bridge: token.bridge } : {}),
      });

      tokens.push({
        type: 'native',
        id: 'NATIVE',
        symbol: id,
        name: token.name,
        chainId,
        oracle: token.oracle || 'tokens',
        oracleId: token.oracleId || id,
        address: 'native',
        decimals: token.decimals,
        ...(token.bridge ? { bridge: token.bridge } : {}),
      });
    } else {
      tokens.push({
        type: 'erc20',
        id,
        symbol: token.symbol,
        name: token.name,
        chainId,
        oracle: token.oracle || 'tokens',
        oracleId: token.oracleId || id,
        address: token.address,
        decimals: token.decimals,
        ...(token.bridge ? { bridge: token.bridge } : {}),
        ...(token.staked ? { staked: token.staked } : {}),
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
    if (token.type === 'native') {
      byAddress[addressLower] = token;
    } else {
      byAddress[addressLower] = {
        ...token,
        address: getAddress(token.address),
      };
    }
  } else {
    // Merge extra info
    const existing = byAddress[addressLower];
    if (!existing.bridge && token.bridge) {
      existing.bridge = token.bridge;
    }
  }
}

async function fetchTokensForChain(chainId: ApiChain): Promise<ChainTokens> {
  if (!isApiChain(chainId)) {
    throw new Error(`Invalid chain ${chainId}`);
  }

  const [vaultTokens, boostTokens, abTokens] = await Promise.all([
    fetchVaultTokensForChain(chainId),
    fetchBoostTokensForChain(chainId),
    fetchAddressBookTokensForChain(chainId),
  ]);

  const byId: Record<TokenEntity['id'], TokenEntity['address']> = {};
  const byAddress: Record<TokenEntity['address'], TokenEntity> = {};

  [...vaultTokens, ...boostTokens, ...abTokens].forEach(token => addToken(token, byId, byAddress));

  // Address book oracle id and symbol takes precedence now
  abTokens.forEach(token => {
    const addressKey = token.address.toLowerCase();
    byAddress[addressKey].oracleId = token.oracleId;
    byAddress[addressKey].symbol = token.symbol;
  });

  if (!byId['NATIVE']) {
    throw new Error(`No native token loaded for chain ${chainId}`);
  }

  if (!byId['WNATIVE']) {
    throw new Error(`No wnative token loaded for chain ${chainId}`);
  }

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
    const chains = Object.keys(MULTICHAIN_ENDPOINTS) as ApiChain[];
    const byChain = await Promise.all(chains.map(chainId => fetchTokensForChain(chainId)));

    chains.forEach((chainId, i) => {
      tokensByChain[chainId] = byChain[i];
      serviceEventBus.emit(`tokens/${chainId}/ready`);
    });

    serviceEventBus.emit('tokens/updated');

    console.log('> Token service updated');
  } catch (err) {
    console.error('> Token service update failed', err);
  } finally {
    // Update tokens whenever boosts or vaults update
    Promise.race([
      serviceEventBus.waitForNextEvent('vaults/updated'),
      serviceEventBus.waitForNextEvent('boosts/updated'),
    ]).then(updateTokens);
  }
}
