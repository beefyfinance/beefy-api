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
  rewardPool: '0xF49c523F08B4e7c8E51a44088ea2a5e6b5f397D9',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x8237f3992526036787E8178Def36291Ab94638CD',
  multicall: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  bifiMaxiStrategy: '0x697aFD2D17e7e274529ABd2db49A2953bb081091',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x3d38BA27974410679afF73abD096D7Ba58870EAd',
  vaultFactory: '0xC551dDCE8e5E657503Cd67A39713c06F2c0d2e97',
} as const;
