const devMultisig = '0x1db98f5D37E6e0E53DCb24F558F0410086920a6e';
const treasuryMultisig = '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  vaultOwner: '0xc8F3D9994bb1670F5f3d78eBaBC35FA8FdEEf8a2',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  bifiMaxiStrategy: '0xb25eB9105549627050AAB3A1c909fBD454014beA',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xeEaFF5116C09ECc20Ab72b53860A7ceAd97F0Ab4',
  vaultFactory: '0x6f6CE0f48481962599DdC6FDb0358c5849F06350',
  zap: '0xEC6eEDbe6B006E1cFA2e22Cb46a132888bFc62D8',
  zapTokenManager: '0x384257e94dcbBDfD7a5EF23AD4E7b4B9E6FcF1F5',

  /// CLM Contracts
  clmFactory: '0x168Da2e2c8a87a053135c49127afbD092E72c8c5',
  clmStrategyFactory: '0x2659b955655b2d94E34A628818E12f1C21110Db3',
  clmRewardPoolFactory: '0x4fdD68Efb5149A47E103fb572Ad2AF49C74AD92D',

  beefySwapper: '0x8F40C4Be6732241222293953475a9e69BFc607AA',
  beefyOracle: '0x4d417C189AE9D1B128397026A124b531A535D741',
  beefyOracleChainlink: '0xc604F4A393205269eEa35314b6A29f9555Ad2648',
  beefyOracleAlgebra: '0xed7f8F288b452a6D1924C477E075dB086E496c19',
} as const;
