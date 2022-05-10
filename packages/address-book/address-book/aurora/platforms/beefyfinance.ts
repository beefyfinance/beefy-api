const devMultisig = '0x7cA9E76141493Fd3B12C0376130158779fB9f8b9';
const treasuryMultisig = '0x088C70Ddff3a3774825dd5e5EaDB356404248d83';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x2d04969ED7D1b186797C44dF5F5634Eb9C89aF6b',
  vaultOwner: '0x19642aDA958632f5e574A6d13eAd0679BD435c20',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0xE6ab45f5e93FA377D0c4cC097187Ab7256c2AEBf',
  treasury: '0x8c2d54BA94f4638f1bb91f623F378B66d6023324',
  beefyFeeRecipient: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  multicall: '0x1198f78efd67DFc917510aaA07d49545f4B24f11',
  bifiMaxiStrategy: '0xD25c56DAbcda719F1c67fE8fc0760f8B942aC95C',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
