const devMultisig = '0xE3c985f5e317eFd4aca1f00aa5F1DFEC40b2Af74';
const treasuryMultisig = '0x523154a03180FD1CB26F39087441c9F91BcD0389';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x6d28afD25a1FBC5409B1BeFFf6AEfEEe2902D89F',
  vaultOwner: '0x2e8B7aba218759C07aA6Ae051FC386D411cF99d3',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x5B96bbAca98D777cb736dd89A519015315E00D02',
  treasury: '0xaDB9DDFA24E326dC9d337561f6c7ba2a6Ecec697',
  beefyFeeRecipient: '0x070c12844A9eB215276DbE178a92cF86157DDBaA',
  multicall: '0xBa5041B1c06e8c9cFb5dDB4b82BdC52E41EA5FC5',
  bifiMaxiStrategy: '0x5135C0af3080DF01ABF66491d5a1eD21fBEF3a7C',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
