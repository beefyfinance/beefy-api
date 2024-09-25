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
  zap?: string;
  zapTokenManager?: string;
  treasurySwapper?: string;

  /// BIFI Token Contracts
  mooBifiLockbox?: string;
  axelarBridge?: string;
  optimismBridge?: string;
  ccipBridge?: string;
  layerZeroBridge?: string;
  mooBifi4626?: string;

  /// CLM Contracts
  clmFactory?: string;
  clmStrategyFactory?: string;
  clmRewardPoolFactory?: string;
  positionMulticall?: string;

  /// Beefy Swapper Contracts
  beefySwapper?: string;
  beefyOracle?: string;
  beefyOracleChainlink?: string;
  beefyOracleChainlinkEthBase?: string;
  beefyOracleUniswapV3?: string;
  beefyOracleUniswapV2?: string;
  beefyOracleSolidly?: string;
  beefyOracleAlgebra?: string;
}
