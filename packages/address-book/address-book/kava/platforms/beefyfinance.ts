const zeroAddress = '0x0000000000000000000000000000000000000000';
const hw = '0xdAec0E93A98b6184816dFDA318B1A01EAF026164';
const treasuryMultisig = '0x07F29FE11FbC17876D9376E3CD6F2112e81feA6F';
const devMultisig = '0x7f1003EBfB807728d255F86eb3D9e0945fb05c69';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x922f8807E781739DDefEe51df990457B522cBCf5',
  vaultOwner: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0xa59da54376Bdb3B49bF58412667054cCBF74BEDc',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  bifiMaxiStrategy: '0xaC3778DC45B5e415DaA78CCC31f25169bD98C43A',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  vaultFactory: '0xCD9b038F012Ecd6b2739934426dDe3D4577e1d3C',
} as const;
