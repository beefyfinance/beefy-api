import BigNumber from 'bignumber.js';
import { keyBy } from 'lodash';
import { getVaultsByTypeChain } from '../stats/getMultichainVaults';
import { getTokensForChain, isTokenNative } from '../tokens/tokens';
import { keysToObject } from '../../utils/array';
import { SupportedChains } from '../../utils/chain';
import { TreasuryAsset, TreasuryAssetRegistry } from './types';
import { getChainValidators, hasChainValidator } from './validatorHelpers';
import { getChainConcentratedLiquidityAssets, hasChainConcentratedLiquidityAssets } from './nftAssets';

// raw 1:1 ppfs, used for gov pools which have none (balanceOf is the staked amount, priced 1:1 by oracleId)
const ONE_PPFS = new BigNumber('1e18');

// Load token address
export function getTokenAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(SupportedChains, chain => {
    const tokens: Record<string, TreasuryAsset> = {};

    for (const [tokenAddress, token] of Object.entries(getTokensForChain(chain))) {
      // WCELO/WMETIS/WGLMR: duplicate as same as native
      if (
        [
          '0x471EcE3750Da237f93B8E339c536989b8978a438',
          '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
          '0x0000000000000000000000000000000000000802',
        ].includes(token.address)
      )
        continue;

      tokens[tokenAddress] = {
        name: token.name,
        address: token.address,
        decimals: token.decimals,
        assetType: isTokenNative(token) ? 'native' : 'token',
        oracleId: token.oracleId,
        oracleType: token.oracle,
        symbol: token.symbol,
        ...(token.staked && { staked: true }),
      };
    }

    if (hasChainValidator(chain)) {
      const validators = getChainValidators(chain);
      for (let i = 0; i < validators.length; i++) {
        tokens[validators[i].id] = validators[i];
      }
    }

    if (hasChainConcentratedLiquidityAssets(chain)) {
      getChainConcentratedLiquidityAssets(chain).forEach(asset => {
        tokens[asset.address.toLowerCase()] = {
          ...asset,
          staked: true,
        };
      });
    }

    return tokens;
  });
}

export function getVaultAddressesByChain(): TreasuryAssetRegistry {
  return keysToObject(SupportedChains, chain => {
    // gov covers both classic earnings pools and CLM reward pools (rCLM); balanceOf returns the staked amount
    const vaults = [...getVaultsByTypeChain('standard', chain), ...getVaultsByTypeChain('gov', chain)];

    return keyBy(
      vaults.map(vault => ({
        name: vault.earnedToken,
        oracleId: vault.oracleId,
        oracleType: vault.oracle,
        assetType: vault.type === 'gov' ? 'gov' : 'vault',
        vaultId: vault.id,
        decimals: vault.tokenDecimals,
        pricePerFullShare: ('pricePerFullShare' in vault && vault.pricePerFullShare) || ONE_PPFS,
        address: vault.earnContractAddress,
        staked: true,
      })),
      asset => asset.address.toLowerCase()
    );
  });
}
