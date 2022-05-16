const devMultisig = '0x3A0b8B7a3ea8D1670e000b1Da5bD41373bF8da42';
const treasuryMultisig = '0x26dE4EBffBE8d3d632A292c972E3594eFc2eCeEd';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x37DC61A76113E7840d4A8F1c1B799cC9ac5Aa854',
  vaultOwner: '0x690216f462615b749bEEB5AA3f1d89a2BEc45Ecf',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A',
  treasury: '0xA3e3Af161943CfB3941B631676134bb048739727',
  beefyFeeRecipient: '0x8Ef7C232470f85Af0809ce5E43888F989eFcAF47',
  multicall: '0x6FfF95AC47b586bDDEea244b3c2fe9c4B07b9F76',
  bifiMaxiStrategy: '0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
