const devMultisig = '0x1db98f5D37E6e0E53DCb24F558F0410086920a6e';
const treasuryMultisig = '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  vaultOwner: '0xc8F3D9994bb1670F5f3d78eBaBC35FA8FdEEf8a2',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  multicall: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  bifiMaxiStrategy: '0xd1bAb603eee03fA99A378d90d5d83186fEB81aA9',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
