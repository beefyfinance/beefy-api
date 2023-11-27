export interface BeefyFinance {
  devMultisig: string;
  treasuryMultisig: string;
  strategyOwner: string;
  vaultOwner: string;
  tokenManager?: string;
  tokenOwner?: string;
  keeper: string;
  treasurer: string;
  launchpoolOwner: string;
  rewardPool: string;
  treasury: string;
  beefyFeeRecipient: string;
  multicall: string;
  bifiMaxiStrategy?: string;
  voter: string;
  beefyFeeConfig?: string;
  vaultFactory?: string;

  mooBifiLockbox?: string;
  axelarBridge?: string;
  optimismBridge?: string;
  ccipBridge?: string;
  layerZeroBridge?: string;
  mooBifi4626?: string;
}
