const devMultisig = '0x6eA680acb92497F6dbe64d93d8a00a6d20106616';
const treasuryMultisig = '0x944819832B287bFb85BB94a163480516a33E819d';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x73F97432Adb2a1c39d0E1a6e554c7d4BbDaFC316',
  vaultOwner: '0xC35a456138dE0634357eb47Ba5E74AFE9faE9a98',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb',
  vaultFactory: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd', // todo
  strategyFactory: '0x4b5f7De737531673B23ceB43D45ea3f1297e4C6d',
  zap: '0x63B257a372AA04c8a078D43BCAAdaD359ce1faa2',
  zapTokenManager: '0xBFd177B973AC0F760782abedFDdec1C18e163aeE',
} as const;
