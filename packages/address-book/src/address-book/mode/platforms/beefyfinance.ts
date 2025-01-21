const devMultisig = '0xB7775ce77ea0dE48699ee5fce86DbD32aAb3B741';
const treasuryMultisig = '0x60CCB0C81D3c8341aAEf520a16a7032Ac63879a6';

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
  multicall: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xEE9b6Fb73FDef41a8865A968410C0cD104209D20',
  vaultFactory: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  strategyFactory: '0x659845671A2190dB066A5a5443172D6C0c35207F',
  zap: '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E',
  zapTokenManager: '0x19e730Ab391b79F03CFA2ffc2C5e3fc617F0eEfe',

  /// CLM Contracts
  clmFactory: '0xd1bAb603eee03fA99A378d90d5d83186fEB81aA9',
  clmStrategyFactory: '0x5E0d19ACe839b2257F1A10Ee1E8b25E6D8930244',
  clmRewardPoolFactory: '0x99097E6C293982f0e05937fdfB45F69eF8914F0e',

  /// Beefy Swapper Contracts
  beefySwapper: '0x78A89b50F3F36cF9F83c8e41c747DD2dA2476b9a',
  beefyOracle: '0xa07704e69fa64408BEfb3ac1891166d8bbC2585c',
  beefyOracleChainlink: '0x4583fAC48BdD776096559514A42a957e3DF93C1A',
  beefyOraclePyth: '0x714A52Cdee18cD074BaA87F1f9631B13d302E516',
  beefyOracleUniswapV3: '0x06B515128cac164C63ba4Fd48229839Ba769f71F',
  beefyOracleAlgebra: '0xa7224e31367069637A8C2cc0aa10B7A90D9343C1',
  beefyOracleKim: '0xB386fe65748E23718E0b3D90B431F7eB1BFA14a9',
} as const;
