const devMultisig = '0xB1F2b9166fCd1d1e71a104C584b6f25cD8f4f36b';
const treasuryMultisig = '0x008f84b4f7B625636dD3E75045704b077D8db445';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62',
  vaultOwner: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  vaultFactory: '0xD19ab62F83380908D65E344567378cF104cE46c2', // todo
} as const;
