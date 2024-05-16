const devMultisig = '0x238dc3781DD668abd5135e233e395885657D304A';
const treasuryMultisig = '0xdFf234670038dEfB2115Cf103F86dA5fB7CfD2D2';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x847298aC8C28A9D66859E750456b92C2A67b876D',
  vaultOwner: '0x4560a83b7eED32EB78C48A5bedE9B608F3184df0',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x7fB900C14c9889A559C777D016a885995cE759Ee',
  treasury: '0xe6CcE165Aa3e52B2cC55F17b1dBC6A8fe5D66610',
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0xC9F6b1B53E056fd04bE5a197ce4B2423d456B982',
  bifiMaxiStrategy: '0x230691a28C8290A553BFBC911Ab2AbA0b2df152D',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x3b282a104794c5d256D285B4ba9ed27375c0b359',
  vaultFactory: '0x740CE0674aF6eEC113A435fAa53B297536A3e89B',
  wrapperFactory: '0x985CA8C1B4Ff5a15E1162BaE1669A928e5a6bD49',
  zap: '0x13761d473fF1478957ADb80CB4E58e0AF76d2C51',
  zapTokenManager: '0x0F10ef4aFbc2a8081307e5b4D017141FD3fCfb7d',
  treasurySwapper: '0xf2EeC1baC39306C0761c816d1D33cF7C9Ad6C0Fe',
} as const;
