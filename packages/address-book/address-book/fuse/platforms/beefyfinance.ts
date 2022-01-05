const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasury = '0x922f8807E781739DDefEe51df990457B522cBCf5';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig: zeroAddress,
  strategyOwner: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  vaultOwner: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: '0x3Eb7fB70C03eC4AEEC97C6C6C1B59B014600b7F7',
  launchpoolOwner: cowllector,
  rewardPool: zeroAddress,
  treasury,
  beefyFeeRecipient: treasury,
  multicall: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
  bifiMaxiStrategy: zeroAddress,
} as const;
