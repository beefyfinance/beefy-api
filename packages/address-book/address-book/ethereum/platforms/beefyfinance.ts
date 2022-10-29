const zeroAddress = '0x0000000000000000000000000000000000000000';
const devMultisig = '0x34fEf5DA92c59d6aC21d0A75ce90B351D0Fb6CE6';
const treasuryMultisig = '0xc9C61194682a3A5f56BF9Cd5B59EE63028aB6041';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x1c9270ac5C42E51611d7b97b1004313D52c80293',
  vaultOwner: '0x5B6C5363851EC9ED29CB7220C39B44E1dd443992',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: treasuryMultisig,
  treasury: treasuryMultisig,
  beefyFeeRecipient: treasuryMultisig,
  multicall: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  // bifiMaxiStrategy: '0xd1bAb603eee03fA99A378d90d5d83186fEB81aA9',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xa9E6E271b27b20F65394914f8784B3B860dBd259',
} as const;
