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
  assetType: 'token' | 'native' | 'vault';
  oracleType: 'lps' | 'tokens';
  oracleId: string;
};

export type VaultAsset = Asset & { pricePerFullShare: string };

export type NativeAsset = Asset & { address: 'native' };

export type ValidatorAsset = Asset & { xxx: string };

export type TreasuryAsset = Asset | VaultAsset | NativeAsset | ValidatorAsset;

export type TreasuryAssetRegistry = {
  [chain: string]: {
    [address: string]: TreasuryAsset;
  };
};
