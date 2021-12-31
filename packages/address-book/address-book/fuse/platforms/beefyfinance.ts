const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasury = '0x922f8807E781739DDefEe51df990457B522cBCf5';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig: zeroAddress,
  strategyOwner: '0xc8BD4Ae3d3A69f0d75e3788d2ee557E66EBC98D8',
  vaultOwner: '0x8B157c6DAeC439b447337A2F08ef055F5182B817',
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
