import BigNumber from 'bignumber.js';
import { isObject } from 'lodash';
import { ApiChain } from '../../utils/chain';

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
  assetType: 'token' | 'native' | 'vault' | 'validator' | 'concLiquidity';
  oracleType: 'lps' | 'tokens';
  oracleId: string;
};

export type TokenAsset = Asset & { assetType: 'token' };

export type VaultAsset = Asset & {
  pricePerFullShare: BigNumber;
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

export type ConcLiquidityAsset = Asset & {
  assetType: 'concLiquidity';
  id: number;
};

export type TreasuryAsset = Asset | VaultAsset | NativeAsset | ValidatorAsset | ConcLiquidityAsset;

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
