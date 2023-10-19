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
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x13aD51a6664973EbD0749a7c84939d973F247921',
  bifiMaxiStrategy: '0x012416d44CD8397BD798c155F91295b6b980ccef',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xDC1dC2abC8775561A6065D0EE27E8fDCa8c4f7ED',
  vaultFactory: '0x8396f3d25d07531a80770Ce3DEA025932C4953f7',
  wrapperFactory: '0x48bF3a071098a09C7D00379b4DBC69Ab6Da83a36',
} as const;
