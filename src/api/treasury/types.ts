import BigNumber from 'bignumber.js';
import { isObject } from 'lodash';

//Treasury wallets
export type TreasuryWallet = {
  address: string;
  label: string;
};

export type ChainTreasuryWallets = {
  [address: string]: TreasuryWallet;
};

export type TreasuryWalletRegistry = {
  [chain: string]: ChainTreasuryWallets;
};

//Assets
export type Asset = {
  address: string;
  name: string;
  decimals: number;
  assetType: 'token' | 'native' | 'vault' | 'validator';
  oracleType: 'lps' | 'tokens';
  oracleId: string;
};

export type TokenAsset = Asset & { assetType: 'token' };

export type VaultAsset = Asset & {
  pricePerFullShare: string;
  vaultId: string;
  assetType: 'vault';
};

export type NativeAsset = Asset & {
  address: 'native';
  assetType: 'native';
};

export type ValidatorAsset = Asset & {
  assetType: 'validator';
  method: 'api' | 'contract';
  methodPath: string;
};

export type TreasuryAsset = Asset | VaultAsset | NativeAsset | ValidatorAsset;

export type TreasuryAssetRegistry = {
  [chain: string]: {
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

export function isTokenAsset(asset: TreasuryAsset): asset is TokenAsset {
  return isObject(asset) && asset.assetType === 'token';
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
  [chain: string]: ChainTreasuryBalance;
};

export type TreasuryReport = {
  [chain: string]: {
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
