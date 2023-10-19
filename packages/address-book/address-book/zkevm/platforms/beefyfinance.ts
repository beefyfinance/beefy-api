const devMultisig = '0xf58a6C2E3AFD2240b2Bc46751114566eA55671B0';
const treasuryMultisig = '0x6fdfb18D09d5fa9a76ac76cb6Cdc53c8F23C3B29';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x3B60F7f25b09E71356cdFFC6475c222A466a2AC9',
  vaultOwner: '0x09D19184F46A32213DF06b981122e06882B61309',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xD19ab62F83380908D65E344567378cF104cE46c2',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  vaultFactory: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
} as const;
