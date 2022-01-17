const cowllector = '0xd529b1894491a0a26B18939274ae8ede93E81dbA';
const zeroAddress = '0x0000000000000000000000000000000000000000';
const treasuryMultisig = '0x0f9602B7E7146a9BaE16dB948281BebDb7C2D095';

export const beefyfinance = {
  devMultisig: '0xFf9810A3dA8a554B84Ed79D67461eCA6Eb3fA9BD',
  treasuryMultisig,
  strategyOwner: '0xdf68Bf80D427A5827Ff2c06A9c70D407e17DC041',
  vaultOwner: '0x41D44B276904561Ac51855159516FD4cB2c90968',
  keeper: '0x10aee6B5594942433e7Fc2783598c979B030eF3D',
  rewarder: cowllector,
  treasurer: treasuryMultisig,
  launchpoolOwner: cowllector,
  rewardPool: '0x2a30C5e0d577108F694d2A96179cd73611Ee069b',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x28A12F017d0D843d43C71235F4F58535B8BE8563',
  multicall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  bifiMaxiStrategy: zeroAddress,
} as const;
