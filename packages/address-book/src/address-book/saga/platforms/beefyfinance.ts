const devMultisig = '0x04db327e5d9A0c680622E2025B5Be7357fC757f0'; // TODO set correct saga address
const treasuryMultisig = '0x10E13f11419165beB0F456eC8a230899E4013BBD'; // TODO set correct saga address

export const beefyfinance = {
  devMultisig, // TODO set correct saga address
  treasuryMultisig, // TODO set correct saga address
  strategyOwner: '0x73F97432Adb2a1c39d0E1a6e554c7d4BbDaFC316', // TODO set correct saga address
  vaultOwner: '0xC35a456138dE0634357eb47Ba5E74AFE9faE9a98', // TODO set correct saga address
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619', // TODO set correct saga address
  treasurer: treasuryMultisig, // TODO set correct saga address
  launchpoolOwner: devMultisig, // TODO set correct saga address
  rewardPool: '0x0000000000000000000000000000000000000000', // TODO set correct saga address
  treasury: '0x0000000000000000000000000000000000000000', // TODO set correct saga address
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B', // TODO set correct saga address
  multicall: '0x0D17eE2ed4e67b626B43C3695586E5aE6a039949', // TODO set correct saga address
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // TODO set correct saga address
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A', // TODO set correct saga address
  beefyFeeConfig: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62', // TODO set correct saga address
  vaultFactory: '0x9818dF1Bdce8D0E79B982e2C3a93ac821b3c17e0', // TODO set correct saga address
  strategyFactory: '0x8e0B63846ebEFf857EE35eF3BD3A2df9EF7D6456', // TODO set correct saga address
  wrapperFactory: '0x0000000000000000000000000000000000000000', // TODO set correct saga address
  zap: '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7', // TODO set correct saga address
  zapTokenManager: '0xd0019D13d2F2eb3BA81bca1650cD45cD2Db6526E', // TODO set correct saga address
  treasurySwapper: '0x0000000000000000000000000000000000000000', // TODO set correct saga address

  /// CLM Contracts
  clmFactory: '0x70127945067E4224d7B6ABfDc6f57e3ea45d5CA4', // TODO set correct saga address
  clmStrategyFactory: '0x7cac900B2f504047b40F5554F633248f78bD960A', // TODO set correct saga address
  clmRewardPoolFactory: '0x542Bf9f89c3Ba0edb7aE5EB4Cf582d349fCdC608', // TODO set correct saga address
  positionMulticall: '0xE6e5732245b3e886DD8897a93D21D29bb652d683', // TODO set correct saga address

  /// Beefy Swapper Contracts
  beefySwapper: '0xBC4a342B0c057501E081484A2d24e576E854F823', // TODO set correct saga address
  beefyOracle: '0x448a3539a591dE3Fb9D5AAE407471D21d40cD315', // TODO set correct saga address
  beefyOracleChainlink: '0x07f1ad98b725Af45485646aC431b7757f50C598A', // TODO set correct saga address
  beefyOracleUniswapV2: '0x2AfB174c22D9eE334895C4e300ab93154d800aA0', // TODO set correct saga address
  beefyOracleUniswapV3: '0xD19ab62F83380908D65E344567378cF104cE46c2', // TODO set correct saga address
} as const;
