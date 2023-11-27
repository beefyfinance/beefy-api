const devMultisig = '0x34fEf5DA92c59d6aC21d0A75ce90B351D0Fb6CE6';
const treasuryMultisig = '0xc9C61194682a3A5f56BF9Cd5B59EE63028aB6041';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x1c9270ac5C42E51611d7b97b1004313D52c80293',
  vaultOwner: '0x5B6C5363851EC9ED29CB7220C39B44E1dd443992',
  tokenManager: '0x23B4a2b256AD52b7C2FCcAFba0Fd96e1E1886F71',
  tokenOwner: '0xFD5D54dB16A514951C5DB740B5780C9A75ddf87B',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0xb1F131437e314614313aAb3a3016FA05c1b0e087',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x65f2145693bE3E75B8cfB2E318A3a74D057e6c7B',
  multicall: '0x9dA9f3C6c45F1160b53D395b0A982aEEE1D212fE',
  bifiMaxiStrategy: '0x697aFD2D17e7e274529ABd2db49A2953bb081091',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0x3d38BA27974410679afF73abD096D7Ba58870EAd',
  vaultFactory: '0xC551dDCE8e5E657503Cd67A39713c06F2c0d2e97',
  wrapperFactory: '0x62fcbc7c3235950eD6dE4168fbd373aF9e8ee0fc',
  mooBifi4626: '0x312CEf8839eDa74DeA9b1EEc10b345071cA3d6da',

  mooBifiLockbox: '0xc6e3d0CAF52E057Fb8950ae9d07aE67602919AcD',
  axelarBridge: '0xaaa6A279fC98b9bF94bD479C90D701417e361fc2',
  optimismBridge: '0xbbb8971aEA2627fa2E1342bb5Bf952Ec521479f2',
  ccipBridge: '0xcccEa7Fe84272995664369334351Fe344E2732aE',
  layerZeroBridge: '0xdddaEc9c267dF24aD66Edc3B2cBe25dB86422051',
} as const;
