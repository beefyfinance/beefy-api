const devMultisig = '0x3A0b8B7a3ea8D1670e000b1Da5bD41373bF8da42';
const treasuryMultisig = '0x26dE4EBffBE8d3d632A292c972E3594eFc2eCeEd';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x37DC61A76113E7840d4A8F1c1B799cC9ac5Aa854',
  vaultOwner: '0x690216f462615b749bEEB5AA3f1d89a2BEc45Ecf',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A',
  treasury: '0xA3e3Af161943CfB3941B631676134bb048739727',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x6FfF95AC47b586bDDEea244b3c2fe9c4B07b9F76',
  bifiMaxiStrategy: '0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xBb0c0A821D1F9bC7405f5370DE5f9D2F11975073',
  vaultFactory: '0xee78529E158E82AC54c89608A9664F5597050526',
  wrapperFactory: '0x1Fa046d28FF749b9D7CF7E9a41BEecd1260F11eD',
  zap: '0x2E72e1436F1a2B2e0d2fa4394Ac06857c7b281B3',
  zapTokenManager: '0x7B86a441D1482BCF326658CEe9b6f189cd4297ff',
  treasurySwapper: '0x2A9c05F5E7b96a93119c2234Af03E2315f02e8b4',

  /// CLM Contracts
  clmFactory: '0xAF393b8ded8b8C1bd0c8707f43E6972C9bF19EE5',
  clmStrategyFactory: '0xEB385232b72dAFe4Ad1906BC6C4968D064a30FC4',
  clmRewardPoolFactory: '0xbE03cb9f257bBA76178965D9391cA283767FF7Fe',
  positionMulticall: '0xf87C6bD210DCbB87B8B73820E1B666b1fc253e8E',

  /// Beefy Swapper Contracts
  beefySwapper: '0x20a93Fc2Eb630B98c9C8ef276867C74cc6D5D7C9',
  beefyOracle: '0xec27635CDD3F68cC6534b3bc381bb585a40bfeD3',
  beefyOracleChainlink: '0x6bA132aa39402241fDd69DDAD6ffCFc7350c3D02',
  beefyOracleUniswapV2: '0xE0345652c9E8e89A1345916A2B6232AeA1BA41f9',
  beefyOracleUniswapV3: '0x9B04B32c42DE4559c9BaD87EC6ce64Fb72AB4C2e',
} as const;
