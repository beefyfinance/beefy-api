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
  //zap: '0x6f66F246Bb436B6f4E66A992C2218b57cD906109',
  //zapTokenManager: '0xD3D46FF34cD495d5B91b8F3C5C552E81E5e3eab5',
  /*
  /// CLM Contracts
  clmFactory: '0xD19ab62F83380908D65E344567378cF104cE46c2',
  clmStrategyFactory: '0xaF0f1B33Ef5A61b88F84BA2Ed2388f2C69fEaB55',
  clmRewardPoolFactory: '0x3C0b1765C379833b86A1704997019A7496Afdfae',
*/
  /// Beefy Swapper Contracts
  beefySwapper: '0x8e0B63846ebEFf857EE35eF3BD3A2df9EF7D6456',
  beefyOracle: '0x2AfB174c22D9eE334895C4e300ab93154d800aA0',
  beefyOracleUniswapV3: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315',
  // beefyOraclePyth: '0xD3f0D11dbe25c5a11bbf2F0a41e0019778EFBE65',
} as const;
