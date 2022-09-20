const treasuryMultisig = '0x3f5eddad52C665A4AA011cd11A21E1d5107d7862';
const devMultisig = '0xf7EC8986c660Fa8269f6440A631B22337f398Ccd';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x6d28afD25a1FBC5409B1BeFFf6AEfEEe2902D89F',
  vaultOwner: '0x9A94784264AaAE397441c1e47fA132BE4e61BdaD',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x48F4634c8383aF01BF71AefBC125eb582eb3C74D',
  treasury: '0xc3a4fdcba79DB04b4C3e352b1C467B3Ba909D84A',
  beefyFeeRecipient: '0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f',
  multicall: '0x13aD51a6664973EbD0749a7c84939d973F247921',
  bifiMaxiStrategy: '0x6207536011918F1A0D8a53Bc426f4Fd54df2E5a8',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED',
} as const;
