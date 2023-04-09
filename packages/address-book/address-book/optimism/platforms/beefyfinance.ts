const devMultisig = '0x2c572743B345ED750907dC95D459dbeaC499D8CF';
const treasuryMultisig = '0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x979a73011e7AB17363d38bee7CF0e4B5032C793e',
  vaultOwner: '0xd08575F5F4DE7212123731088980D069CB75873D',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x61645aE7BB524C2ea11cF90D673079EE2AbbB961',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8',
  multicall: '0x820ae7BF39792D7ce7befC70B0172F4D267F1938',
  bifiMaxiStrategy: '0xC808b28A006c91523De75EA23F48BE8b7a9536D1',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x216EEE15D1e3fAAD34181f66dd0B665f556a638d',
  vaultFactory: '0xA6D3769faC465FC0415e7E9F16dcdC96B83C240B',
  wrapperFactory: '0x182be93E1C0C4d305fe43bD093292F21fd679797',
} as const;
