import type { BigNumber } from 'bignumber.js';
import { isObject } from 'lodash-es';
import type { ApiChain } from '../../utils/chain.ts';

//Treasury wallets
export type TreasuryWallet = {
  address: string;
  label: string;
};

export type ChainTreasuryWallets = {
  [address: string]: TreasuryWallet;
};

export type TreasuryWalletRegistry = {
  [chain in ApiChain]: ChainTreasuryWallets;
};

//Assets
export type Asset = {
  address: string;
  name: string;
  decimals: number;
  assetType: 'token' | 'native' | 'vault' | 'gov' | 'validator' | 'concLiquidity' | 'locked-token';
  oracleType: 'lps' | 'tokens';
  oracleId: string;
  symbol?: string;
  staked?: boolean;
};

export type TokenAsset = Asset & { assetType: 'token' };

export type VaultAsset = Asset & {
  pricePerFullShare: BigNumber;
  vaultId: string;
  assetType: 'vault';
};

// gov pools (CLM reward pools, earnings pools); same shape as vaults, ppfs is always 1:1
export type GovAsset = Asset & {
  pricePerFullShare: BigNumber;
  vaultId: string;
  assetType: 'gov';
};

export type NativeAsset = Asset & {
  address: 'native';
  assetType: 'native';
};

export type ValidatorAsset = Asset & {
  id: string;
  assetType: 'validator';
  method: 'api' | 'sonic-contract';
  methodPath: string;
  numberId?: number;
  helper?: string;
};

export type ConcLiquidityAsset = Asset & {
  assetType: 'concLiquidity';
  id: number;
};

export type TreasuryAsset = Asset | VaultAsset | GovAsset | NativeAsset | ValidatorAsset | ConcLiquidityAsset;

export type TreasuryAssetRegistry = {
  [chain in ApiChain]?: {
    [address: string]: TreasuryAsset;
  };
};

export function isNativeAsset(asset: TreasuryAsset): asset is NativeAsset {
  return isObject(asset) && asset.assetType === 'native';
}

export function isValidatorAsset(asset: TreasuryAsset): asset is ValidatorAsset {
  return isObject(asset) && asset.assetType === 'validator';
}

export function isVaultAsset(asset: TreasuryAsset): asset is VaultAsset {
  return isObject(asset) && asset.assetType === 'vault';
}

export function isGovAsset(asset: TreasuryAsset): asset is GovAsset {
  return isObject(asset) && asset.assetType === 'gov';
}

export function isTokenAsset(asset: TreasuryAsset): asset is TokenAsset {
  return isObject(asset) && asset.assetType === 'token';
}

export function isConcLiquidityAsset(asset: TreasuryAsset): asset is ConcLiquidityAsset {
  return isObject(asset) && asset.assetType === 'concLiquidity';
}

export type AssetBalance = {
  address: string;
  balances: {
    [walletAddress: string]: BigNumber;
  };
};

export type ChainTreasuryBalance = {
  [address: string]: {
    address: string;
    balances: {
      [walletAddress: string]: BigNumber;
    };
  };
};

export type TreasuryBalances = {
  [chain in ApiChain]?: ChainTreasuryBalance;
};

export type TreasuryReport = {
  [chain in ApiChain]?: {
    [treasuryAddress: string]: {
      name: string;
      balances: {
        [assetAddress: string]: TreasuryAsset & {
          usdValue: string;
          balance: string;
          price: number;
        };
      };
    };
  };
};

export type TreasuryApiResult = {
  apiAsset: TreasuryAsset;
  balance: BigNumber;
};
