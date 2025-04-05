const devMultisig = '0xC011f5D199F4FCf9CCdDF8DF1afc140F537aAFf1';
const treasuryMultisig = '0x37Ed06D71dFFB97b6E89469EBf29552DA46E52fA';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x09D19184F46A32213DF06b981122e06882B61309',
  vaultOwner: '0x3B60F7f25b09E71356cdFFC6475c222A466a2AC9',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  vaultFactory: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62',
  strategyFactory: '0xAF393b8ded8b8C1bd0c8707f43E6972C9bF19EE5',
  wrapperFactory: '0x234f7F81434e340910A84F45F8e89D07fa86611A',
  zap: '0x992Ccc9D9b8b76310E044660E96171116820F019',
  zapTokenManager: '0xA59BB0da9565e03f53AeFC94fcC205c52Fc925B7',

  /// CLM Contracts
  clmFactory: '0xFa423f283ff7e03F3c2471E83896ba718d3dE4B4',
  clmStrategyFactory: '0x50fcE35b5fEFb174FD8A170cf12297c5B2808FC8',
  clmRewardPoolFactory: '0x89607F5bA649ab2a72921D9b406eb830041f82ef',
  positionMulticall: '0x4a902F6596cCf51c6c1FF5Cc055f69Aa1DD06277',

  /// Beefy Swapper Contracts
  beefySwapper: '0x83e61C634BCD5f7cD79B11d63f27B8005Aa8Fd54',
  beefyOracle: '0x482f7aBa53d24DC7d3dDe58a36d3666DA2Eed3df',
  beefyOracleChainlink: '0x679d78307720CCdDFf572cc56E3C35F9861033Bc',
  beefyOracleUniswapV2: '0xdCd7d53b7D6005aF8d2d86b0974d5CcB14F21A75',
  beefyOracleUniswapV3: '0x2A9c05F5E7b96a93119c2234Af03E2315f02e8b4',
} as const;
