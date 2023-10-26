const devMultisig = '0xFf9810A3dA8a554B84Ed79D67461eCA6Eb3fA9BD';
const treasuryMultisig = '0x0f9602B7E7146a9BaE16dB948281BebDb7C2D095';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xdf68Bf80D427A5827Ff2c06A9c70D407e17DC041',
  vaultOwner: '0x41D44B276904561Ac51855159516FD4cB2c90968',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x2a30C5e0d577108F694d2A96179cd73611Ee069b',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
  bifiMaxiStrategy: '0x436D5127F16fAC1F021733dda090b5E6DE30b3bB',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x11cB33Ef34C53DfcaA3aDdDE9a83f742ffFcfa27',
  vaultFactory: '0x52d998A110E447648095671bb66993461Da9ea38',
  wrapperFactory: '0xDf29382141059afD25Deb624E6c8f13A051012Be',
} as const;
