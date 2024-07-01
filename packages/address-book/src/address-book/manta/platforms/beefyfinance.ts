const devMultisig = '0x9b432520312d809305ad4977AF3df1E58EDAAc49';
const treasuryMultisig = '0x3f33bfA32C5DbdF4Ab6900d45dDbacff0d2F31dE';

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
  multicall: '0x3B60F7f25b09E71356cdFFC6475c222A466a2AC9',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
  vaultFactory: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  zap: '0x6f66F246Bb436B6f4E66A992C2218b57cD906109',
  zapTokenManager: '0xD3D46FF34cD495d5B91b8F3C5C552E81E5e3eab5',

  /// CLM Contracts
  clmFactory: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  clmStrategyFactory: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  clmRewardPoolFactory: '0x9818dF1Bdce8D0E79B982e2C3a93ac821b3c17e0',

  /// Beefy Swapper Contracts
  beefySwapper: '0x07f1ad98b725Af45485646aC431b7757f50C598A',
  beefyOracle: '0x2AfB174c22D9eE334895C4e300ab93154d800aA0',
  beefyOracleUniswapV3: '0xD19ab62F83380908D65E344567378cF104cE46c2',
  beefyOraclePyth: '0xD3f0D11dbe25c5a11bbf2F0a41e0019778EFBE65',
} as const;
