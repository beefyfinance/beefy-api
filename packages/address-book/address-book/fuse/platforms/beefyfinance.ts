const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasuryMultisig = '0x1C124c2CaB83b3C3B5D0f0899CeeA5e06964599F';

export const beefyfinance = {
  devMultisig: '0xe26a8aC2936F338Fd4DAebA4BD22a7ec86465fE1',
  treasuryMultisig,
  strategyOwner: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  vaultOwner: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: treasuryMultisig,
  launchpoolOwner: cowllector,
  rewardPool: '0xc8BD4Ae3d3A69f0d75e3788d2ee557E66EBC98D8',
  treasury: '0x922f8807E781739DDefEe51df990457B522cBCf5',
  beefyFeeRecipient: '0x8B157c6DAeC439b447337A2F08ef055F5182B817',
  multicall: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
  bifiMaxiStrategy: zeroAddress,
} as const;
