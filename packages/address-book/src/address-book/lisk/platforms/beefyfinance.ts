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
  strategyFactory: '0x2ec5d5e9aaf3c3f56eBeF2fC46A5af9e42810b41',
  zap: '0xaF0f1B33Ef5A61b88F84BA2Ed2388f2C69fEaB55',
  zapTokenManager: '0x60242b3c90a3F477a0FC5B4095f5946583Fbd6ce',

  /// CLM Contracts
  clmFactory: '0x3C0b1765C379833b86A1704997019A7496Afdfae',
  clmStrategyFactory: '0x7cac900B2f504047b40F5554F633248f78bD960A',
  clmRewardPoolFactory: '0xA5Cd8A60a05571141370D184e255777e5c2d5968',
  positionMulticall: '0x03C2E2e84031d913d45B1F5b5dDC8E50Fcb28652',

  /// Beefy Swapper Contracts
  beefySwapper: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  beefyOracle: '0x07f1ad98b725Af45485646aC431b7757f50C598A',
  beefyOracleChainlink: '0x2AfB174c22D9eE334895C4e300ab93154d800aA0',
  beefyOracleUniswapV3: '0xD19ab62F83380908D65E344567378cF104cE46c2',
} as const;
