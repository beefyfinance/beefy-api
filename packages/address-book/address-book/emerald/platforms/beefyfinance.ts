const devMultisig = '0xFD62896e88a5Da93eCC987cb0bE2501722886863';
const treasuryMultisig = '0x8FD0869271d26E6653f5d5650685630F75b6AEDf';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
  vaultOwner: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  multicall: '0xFE40f6eAD11099D91D51a945c145CFaD1DD15Bb8',
  bifiMaxiStrategy: '0xd1bAb603eee03fA99A378d90d5d83186fEB81aA9',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
