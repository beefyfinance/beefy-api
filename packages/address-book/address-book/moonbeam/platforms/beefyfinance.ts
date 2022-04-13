const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasury = '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A';

export const beefyfinance = {
  devMultisig: '0x1db98f5D37E6e0E53DCb24F558F0410086920a6e',
  treasuryMultisig: '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A',
  strategyOwner: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
  vaultOwner: '0xc8F3D9994bb1670F5f3d78eBaBC35FA8FdEEf8a2',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasury,
  launchpoolOwner: cowllector,
  rewardPool: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  treasury,
  beefyFeeRecipient: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  multicall: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  bifiMaxiStrategy: zeroAddress,
} as const;
