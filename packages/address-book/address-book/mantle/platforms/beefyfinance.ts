const devMultisig = '0x92051b197D2Ee9Dae8d042aD6862ED3341e02c73';
const treasuryMultisig = '0x997A95C097Ade5Cb48649D38F929A5e422dFe96E';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x0D17eE2ed4e67b626B43C3695586E5aE6a039949',
  vaultOwner: '0x73F97432Adb2a1c39d0E1a6e554c7d4BbDaFC316',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xAb35d11199216c7F7368080Cf41beD8f3AbBc4E4',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x8e0B63846ebEFf857EE35eF3BD3A2df9EF7D6456',
  vaultFactory: '0xfc69704cC3cAac545cC7577009Ea4AA04F1a61Eb', // todo
} as const;
