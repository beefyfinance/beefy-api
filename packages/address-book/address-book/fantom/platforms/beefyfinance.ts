const devMultisig = '0x238dc3781DD668abd5135e233e395885657D304A';
const treasuryMultisig = '0xdFf234670038dEfB2115Cf103F86dA5fB7CfD2D2';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x847298aC8C28A9D66859E750456b92C2A67b876D',
  vaultOwner: '0x4560a83b7eED32EB78C48A5bedE9B608F3184df0',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x7fB900C14c9889A559C777D016a885995cE759Ee',
  treasury: '0xe6CcE165Aa3e52B2cC55F17b1dBC6A8fe5D66610',
  beefyFeeRecipient: '0x502C107ae28d300fDAedE1CBd7ee8096C1ab4a3C',
  multicall: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  bifiMaxiStrategy: '0x230691a28C8290A553BFBC911Ab2AbA0b2df152D',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
