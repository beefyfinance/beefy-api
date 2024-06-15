const devMultisig = '0xB1F2b9166fCd1d1e71a104C584b6f25cD8f4f36b';
const treasuryMultisig = '0x008f84b4f7B625636dD3E75045704b077D8db445';

export const beefyfinance = {
  devMultisig: devMultisig,
  treasuryMultisig: treasuryMultisig,
  strategyOwner: '0x2b0C9702A4724f2BFe7922DB92c4082098533c62',
  vaultOwner: '0x2840463Ea288c26B66E24f92E8C704e1aB6b095c',
  keeper: '0x4fED5491693007f0CD49f4614FFC38Ab6A04B619',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x0000000000000000000000000000000000000000',
  treasury: treasuryMultisig,
  beefyFeeRecipient: '0x02Ae4716B9D5d48Db1445814b0eDE39f5c28264B',
  multicall: '0x91BB303E972995EbE5f593BCddBb6F5Ef49Dbcbd',
  bifiMaxiStrategy: '0x0000000000000000000000000000000000000000', // Not used
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
  beefyFeeConfig: '0xBC4a342B0c057501E081484A2d24e576E854F823',
  vaultFactory: '0xD19ab62F83380908D65E344567378cF104cE46c2', // todo
  wrapperFactory: '0xDBad28672fD60c4609EE6B26dF2b8cB93DE12afe',
  zap: '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E',
  zapTokenManager: '0x19e730Ab391b79F03CFA2ffc2C5e3fc617F0eEfe',

  /// CLM Contracts
  clmFactory: '0x94891042503D4Db76f48D952E7c2cb94453Cd31f',
  clmStrategyFactory: '0xf02e4CF65bE25baA5713082953354A675EA3DB77',
  clmRewardPoolFactory: '0xEEDeA72eE54c335BD5388Fc40b2f6F3AAda5e0b2',

  /// Beefy Swapper Contracts
  beefySwapper: '0x5aD159A8537fE39CAD81748726584C05b68b3c11',
  beefyOracle: '0x3923704D9684ABb234743d65D96c43Bf26414481',
  beefyOracleChainlink: '0xF8813A9274ff8E69cea6d1aa4c32A29054A05D40',
  beefyOracleChainlinkEthBase: '0x357a64804AD7e36AF3C1D9B1c30E72bDeE2897a7',
  beefyOracleSolidly: '0x142ED7b2bA7be67F54b1BB312353a5Bb849252F9',
  beefyOracleUniswapV3: '0xe1908Ab7e03F0699773ceCc4Dc5D38893E532cd1',
} as const;
