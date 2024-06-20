const devMultisig = '0x2c572743B345ED750907dC95D459dbeaC499D8CF';
const treasuryMultisig = '0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x979a73011e7AB17363d38bee7CF0e4B5032C793e',
  vaultOwner: '0xd08575F5F4DE7212123731088980D069CB75873D',
  tokenManager: '0x82FbDEb4a265dE010f15DfB4F17e21940B7B7470',
  tokenOwner: '0x9C1E1C57ff38E154200bfCd9810eC653DaBb6Bd5',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x61645aE7BB524C2ea11cF90D673079EE2AbbB961',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x820ae7BF39792D7ce7befC70B0172F4D267F1938',
  bifiMaxiStrategy: '0xC808b28A006c91523De75EA23F48BE8b7a9536D1',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x216EEE15D1e3fAAD34181f66dd0B665f556a638d',
  vaultFactory: '0xA6D3769faC465FC0415e7E9F16dcdC96B83C240B',
  wrapperFactory: '0x182be93E1C0C4d305fe43bD093292F21fd679797',
  zap: '0xE82343A116d2179F197111D92f9B53611B43C01c',
  zapTokenManager: '0x5a32F67C5eD74dc1b2e031b1bc2c3E965073424F',
  axelarBridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
  optimismBridge: '0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2',
  ccipBridge: '0xcccEa7Fe84272995664369334351Fe344E2732aE',
  layerZeroBridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
  treasurySwapper: '0x852C903e5Bc93F526AB254BFEe0c1DFF23CF82aB',

  /// CLM Contracts
  clmFactory: '0x55D0efec44ee905fC3e12CcB9f25bBd5ccE0ab9C',
  clmStrategyFactory: '0x3B2D461464b9052Dfe52a17f10aA9e3b17332F2d',
  clmRewardPoolFactory: '0x4399457CB360fC37242d2BE326579Caf3981c769',

  /// Beefy Swapper Contracts
  beefySwapper: '0xe115b50c52cB5624fD76232cDF498ADA6ECD1e69',
  beefyOracle: '0x7066606233Cc8b5ede0925003F8910FF7B15219C',
  beefyOracleChainlink: '0x5232Afb1d3cf314bF4D93C83C7AfB98b696ABAa4',
  beefyOracleSolidly: '0xC52B17679d4F3bDF2bfE2ffE64723cA6ab473179',
  beefyOracleUniswapV3: '0x4194cbcF85A1B3f419741432Ae455f28d51Ee7EF',
} as const;
