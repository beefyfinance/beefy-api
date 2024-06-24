const treasuryMultisig = '0xF09d213EE8a8B159C884b276b86E08E26B3bfF75';
const devMultisig = '0x1EFaC1e630939ee5422557D986add59E4996a67C';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  vaultOwner: '0xc8F3D9994bb1670F5f3d78eBaBC35FA8FdEEf8a2',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x448423356726dd7dC168e714C80adDb077f83738',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xc34b9c9DBB39Be0Ef850170127A7b4283484f804',
  bifiMaxiStrategy: '0x3B9bcE784d0582f08ED8a8aDA6593f53D1efaFD0',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x09EF0e7b555599A9F810789FfF68Db8DBF4c51a0',
  vaultFactory: '0x4B5BB994cB7Bd88F064A1f4141a2399000339aCc',
  //wrapperFactory: '0x48bF3a071098a09C7D00379b4DBC69Ab6Da83a36',
} as const;
