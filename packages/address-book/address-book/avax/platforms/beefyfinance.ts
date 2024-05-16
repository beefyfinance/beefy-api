const devMultisig = '0x3A0b8B7a3ea8D1670e000b1Da5bD41373bF8da42';
const treasuryMultisig = '0x26dE4EBffBE8d3d632A292c972E3594eFc2eCeEd';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x37DC61A76113E7840d4A8F1c1B799cC9ac5Aa854',
  vaultOwner: '0x690216f462615b749bEEB5AA3f1d89a2BEc45Ecf',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x86d38c6b6313c5A3021D68D1F57CF5e69197592A',
  treasury: '0xA3e3Af161943CfB3941B631676134bb048739727',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x6FfF95AC47b586bDDEea244b3c2fe9c4B07b9F76',
  bifiMaxiStrategy: '0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xBb0c0A821D1F9bC7405f5370DE5f9D2F11975073',
  vaultFactory: '0xee78529E158E82AC54c89608A9664F5597050526',
  wrapperFactory: '0x1Fa046d28FF749b9D7CF7E9a41BEecd1260F11eD',
  zap: '0x2E72e1436F1a2B2e0d2fa4394Ac06857c7b281B3',
  zapTokenManager: '0x7B86a441D1482BCF326658CEe9b6f189cd4297ff',
  treasurySwapper: '0x2A9c05F5E7b96a93119c2234Af03E2315f02e8b4',
} as const;
