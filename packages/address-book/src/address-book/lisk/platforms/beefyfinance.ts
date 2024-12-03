
const treasuryMultisig = '0xe1E7940d77b7Ed600005eb16Fe05833c2C2E7214';
const devMultisig = '0x907Ef6b428E55c64081C75dec36771d35c25534b';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x0D17eE2ed4e67b626B43C3695586E5aE6a039949',
  vaultOwner: '0x73F97432Adb2a1c39d0E1a6e554c7d4BbDaFC316',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: '0x0000000000000000000000000000000000000000',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xEE9b6Fb73FDef41a8865A968410C0cD104209D20',
  vaultFactory: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  strategyFactory: '0x0000000000000000000000000000000000000000',
  zap: '0x0000000000000000000000000000000000000000',
  zapTokenManager: '0x0000000000000000000000000000000000000000',

  /// CLM Contracts
  clmFactory: '0x0000000000000000000000000000000000000000',
  clmStrategyFactory: '0x0000000000000000000000000000000000000000',
  clmRewardPoolFactory: '0x0000000000000000000000000000000000000000',

  /// Beefy Swapper Contracts
  beefySwapper: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  beefyOracle: '0x07f1ad98b725Af45485646aC431b7757f50C598A',
 /* beefyOracleChainlink: '0x0000000000000000000000000000000000000000',
  beefyOracleChainlinkEthBase: '0x0000000000000000000000000000000000000000',
  beefyOracleUniswapV3: '0x0000000000000000000000000000000000000000',
  beefyOracleSolidly: '0x0000000000000000000000000000000000000000',
  beefyOracleAlgebra: '0x0000000000000000000000000000000000000000',*/
} as const;
