const devMultisig = '0xC011f5D199F4FCf9CCdDF8DF1afc140F537aAFf1';
const treasuryMultisig = '0x37Ed06D71dFFB97b6E89469EBf29552DA46E52fA';

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
  multicall: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  vaultFactory: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62',
} as const;
