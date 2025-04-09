const devMultisig = '0x04db327e5d9A0c680622E2025B5Be7357fC757f0';
const treasuryMultisig = '0x10E13f11419165beB0F456eC8a230899E4013BBD';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x73F97432Adb2a1c39d0E1a6e554c7d4BbDaFC316',
  vaultOwner: '0xC35a456138dE0634357eb47Ba5E74AFE9faE9a98',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: '0x0000000000000000000000000000000000000000',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x0D17eE2ed4e67b626B43C3695586E5aE6a039949',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62',
  vaultFactory: '0x8e0B63846ebEFf857EE35eF3BD3A2df9EF7D6456',
  strategyFactory: '0x2ec5d5e9aaf3c3f56eBeF2fC46A5af9e42810b41',
  wrapperFactory: '0x0000000000000000000000000000000000000000',
  zap: '0x03C2E2e84031d913d45B1F5b5dDC8E50Fcb28652',
  zapTokenManager: '0x5B8F906E9E3355155F05A9c46c5bF3e6D1dEBE5E',
  treasurySwapper: '0x0000000000000000000000000000000000000000',

  /// CLM Contracts
  clmFactory: '0xD19ab62F83380908D65E344567378cF104cE46c2',
  clmStrategyFactory: '0xC2cEE7cf27D2Eda09fEc1743f3953dA77Bf1DA61',
  clmRewardPoolFactory: '0x3C0b1765C379833b86A1704997019A7496Afdfae',
  positionMulticall: '0x542Bf9f89c3Ba0edb7aE5EB4Cf582d349fCdC608',

  /// Beefy Swapper Contracts
  beefySwapper: '0x9818dF1Bdce8D0E79B982e2C3a93ac821b3c17e0',
  beefyOracle: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  beefyOracleChainlink: '0x7cac900B2f504047b40F5554F633248f78bD960A',
  beefyOracleUniswapV2: '0x40192E01124a927144eb5258a333982005248d4a',
  beefyOracleUniswapV3: '0xaF0f1B33Ef5A61b88F84BA2Ed2388f2C69fEaB55',
} as const;
