const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasuryMultisig = '0x0f9602B7E7146a9BaE16dB948281BebDb7C2D095';

export const beefyfinance = {
  devMultisig: '0xFf9810A3dA8a554B84Ed79D67461eCA6Eb3fA9BD',
  treasuryMultisig,
  strategyOwner: zeroAddress,
  vaultOwner: zeroAddress,
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: treasuryMultisig,
  launchpoolOwner: cowllector,
  rewardPool: zeroAddress,
  treasury: treasuryMultisig,
  beefyFeeRecipient: zeroAddress,
  multicall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  bifiMaxiStrategy: zeroAddress,
} as const;
