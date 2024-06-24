const devMultisig = '0xB7775ce77ea0dE48699ee5fce86DbD32aAb3B741';
const treasuryMultisig = '0x60CCB0C81D3c8341aAEf520a16a7032Ac63879a6';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x09D19184F46A32213DF06b981122e06882B61309',
  vaultOwner: '0x3B60F7f25b09E71356cdFFC6475c222A466a2AC9',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xEE9b6Fb73FDef41a8865A968410C0cD104209D20',
  vaultFactory: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  zap: '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E',
  zapTokenManager: '0x19e730Ab391b79F03CFA2ffc2C5e3fc617F0eEfe',
} as const;
