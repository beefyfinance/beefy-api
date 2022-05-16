const devMultisig = '0xe26a8aC2936F338Fd4DAebA4BD22a7ec86465fE1';
const treasuryMultisig = '0x1C124c2CaB83b3C3B5D0f0899CeeA5e06964599F';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  vaultOwner: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x60a4DedF7fC45F73d9ca46222B016c2d755C79A8',
  treasury: '0x922f8807E781739DDefEe51df990457B522cBCf5',
  beefyFeeRecipient: '0x32C82EE8Fca98ce5114D2060c5715AEc714152FB',
  multicall: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
  bifiMaxiStrategy: '0x79149B500f0d796aA7f85e0170d16C7e79BAd3C5',
  validator: '0xEc4B821541f62b63832ceE400d6c29bCc84E4e38',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
