const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasuryMultisig = '0x0000000000000000000000000000000000000000';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig,
  strategyOwner: zeroAddress,
  vaultOwner: zeroAddress,
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: treasuryMultisig,
  launchpoolOwner: cowllector,
  rewardPool: zeroAddress,
  treasury: zeroAddress,
  beefyFeeRecipient: zeroAddress,
  multicall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  bifiMaxiStrategy: zeroAddress,
} as const;
