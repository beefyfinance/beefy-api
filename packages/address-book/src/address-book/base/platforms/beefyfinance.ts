const devMultisig = '0x6FfaCA7C3B38Ec2d631D86e15f328ee6eF6C6226';
const treasuryMultisig = '0x1A07DceEfeEbBA3D1873e2B92BeF190d2f11C3cB';

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
  multicall: '0xbA790ec6F95D68123E772A43b314464585B311b4',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  vaultFactory: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  wrapperFactory: '0x917447f8f52E7Db26cE7f52BE2F3fcb4d4D00832',
  zap: '0x6F19Da51d488926C007B9eBaa5968291a2eC6a63',
  zapTokenManager: '0x3fBD1da78369864c67d62c242d30983d6900c0f0',
  treasurySwapper: '0x88D19A03C429029901d917510f8f582D2E5F803B',
  axelarBridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
  layerZeroBridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
  tokenManager: '0xEFF32d64e6fB389feb5e9d76C7F1388f0eC0F29B',

  /// CLM Contracts
  clmFactory: '0x7bC78990AC1ef0754CFdE935B2D84E9acF13ed29',
  clmStrategyFactory: '0x9476284d81121613DA5DF5C72f50853a455448F1',
  clmRewardPoolFactory: '0x13F518Aa15CA3296E51CEAFB44A8D86660E97B3a',

  /// Beefy Swapper Contracts
  beefySwapper: '0x9F8c6a094434C6E6f5F2792088Bb4d2D5971DdCc',
  beefyOracle: '0x1BfA205114678c7d17b97DB7A71819D3E6718eb4',
  beefyOracleChainlink: '0xf35D758fd1a21168F09e674a67DFEA8c9860545B',
  beefyOracleUniswapV2: '0x42856BB9fad9D4E8821f0Abe1ee6930eb6D05dcD',
  beefyOracleSolidly: '0xF5b2701b649691Ea35480E5dbfe0F7E5D8AbA1C1',
  beefyOracleUniswapV3: '0xe573af49001b599Faefedd57F266EC503cf88B94',
} as const;
