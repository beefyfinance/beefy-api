const zeroAddress = '0x0000000000000000000000000000000000000000';
const hw = '0x3Eb7fB70C03eC4AEEC97C6C6C1B59B014600b7F7';

export const beefyfinance = {
  devMultisig: zeroAddress,
  treasuryMultisig: zeroAddress,
  strategyOwner: '0x587479672077fBD7cb08EE1fd13fca6a9ef69d9e',
  vaultOwner: '0xBB54a8F862e2D4Cc03634a26974c5C3bEfd06836',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: hw,
  launchpoolOwner: hw,
  rewardPool: '0x5f7347fedfD0b374e8CE8ed19Fc839F59FB59a3B',
  treasury: '0xf4859A3f36fBcA24BF8299bf56359fB441b03034',
  beefyFeeRecipient: '0x250EB557D7a767ee711c7C11988470669a5306BB',
  multicall: '0x2776CF9B6E2Fa7B33A37139C3CB1ee362Ff0356e',
  bifiMaxiStrategy: '0xfdF1088F5B9Bd338D5197aCfB00b468f04bCC374',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
