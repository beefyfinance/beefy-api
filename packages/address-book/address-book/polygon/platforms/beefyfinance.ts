const devMultisig = '0x09dc95959978800E57464E962724a34Bb4Ac1253';
const treasuryMultisig = '0xe37dD9A535c1D3c9fC33e3295B7e08bD1C42218D';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0x6fd13191539e0e13B381e1a3770F28D96705ce91',
  vaultOwner: '0x94A9D4d38385C7bD5715A2068D69B87FF81F4BF3',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0xDeB0a777ba6f59C78c654B8c92F80238c8002DD2',
  treasury: '0x09EF0e7b555599A9F810789FfF68Db8DBF4c51a0',
  beefyFeeRecipient: '0x6FB16F7F2C1f1BDA14d4277530A92d4404b7Fb7e',
  multicall: '0xC3821F0b56FA4F4794d5d760f94B812DE261361B',
  bifiMaxiStrategy: '0xD126BA764D2fA052Fc14Ae012Aef590Bc6aE0C4f',
  beefyFeeConverterETHtoWMATIC: '0x166Ea67fA3F2257B9bafF28AaF006D33674acA7e',
  vaultRegistry: '0x820cE73c7F15C2b828aBE79670D7e61731AB93Be',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
