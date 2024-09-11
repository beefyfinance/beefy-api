const devMultisig = '0x7a239E822aA02Df7FF99bc26DDf32eeAe3ffb276';
const treasuryMultisig = '0x60CCB0C81D3c8341aAEf520a16a7032Ac63879a6';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x3B60F7f25b09E71356cdFFC6475c222A466a2AC9',
  vaultOwner: '0x09D19184F46A32213DF06b981122e06882B61309',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  vaultFactory: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  zap: '0x0465375274301FFCDf3274e59544d535e03B3688',
  zapTokenManager: '0x7B9f2Da828b12fCF7B4154465979a89830C8F57d',

  /// CLM Contracts
  clmFactory: '0x2AfB174c22D9eE334895C4e300ab93154d800aA0',
  clmStrategyFactory: '0x70127945067E4224d7B6ABfDc6f57e3ea45d5CA4',
  clmRewardPoolFactory: '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7',

  /// Beefy Swapper Contracts
  beefySwapper: '0x8e0B63846ebEFf857EE35eF3BD3A2df9EF7D6456',
  beefyOracle: '0x9818dF1Bdce8D0E79B982e2C3a93ac821b3c17e0',
  beefyOracleUniswapV3: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  beefyOraclePyth: '0x2ec5d5e9aaf3c3f56eBeF2fC46A5af9e42810b41',
  beefyOracleSolidly: '0x10323d298C7Ea8d4E577ABF3Fb802a6CbD354FAe',
} as const;
