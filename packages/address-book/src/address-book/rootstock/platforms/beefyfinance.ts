const devMultisig = '0xB7775ce77ea0dE48699ee5fce86DbD32aAb3B741';
const treasuryMultisig = '0x2052e5744d1dC4D095e758120779E0f5a660f655';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x09D19184F46A32213DF06b981122e06882B61309',
  vaultOwner: '0xf2EeC1baC39306C0761c816d1D33cF7C9Ad6C0Fe',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x5Eb5CcF31F73ECBa126846fd264538576e01F89b',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  vaultFactory: '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7',
  zap: '0x2E0A7064A5bA7B9b7499997D91885BaDd5FC45f6',
  zapTokenManager: '0xC01cE221D1da322A5B8322fC195b407FEa32240E',

  /// CLM Contracts
  clmFactory: '0xC2cEE7cf27D2Eda09fEc1743f3953dA77Bf1DA61',
  clmStrategyFactory: '0x0465375274301FFCDf3274e59544d535e03B3688',
  clmRewardPoolFactory: '0x7cac900B2f504047b40F5554F633248f78bD960A',
  positionMulticall: '0x2ec5d5e9aaf3c3f56eBeF2fC46A5af9e42810b41',

  /// Beefy Swapper Contracts
  beefySwapper: '0x3C0b1765C379833b86A1704997019A7496Afdfae',
  beefyOracle: '0x70127945067E4224d7B6ABfDc6f57e3ea45d5CA4',
  beefyOracleUniswapV3: '0xA5Cd8A60a05571141370D184e255777e5c2d5968',
} as const;
