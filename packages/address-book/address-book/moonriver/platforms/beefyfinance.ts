const devMultisig = '0x1FDd00B45eBA7F6d35b92803EadDD68F7Cc4A193';
const treasuryMultisig = '0x617f12E04097F16e73934e84f35175a1B8196551';

export const beefyfinance = {
  devMultisig,
  treasuryMultisig,
  strategyOwner: '0xc8BD4Ae3d3A69f0d75e3788d2ee557E66EBC98D8',
  vaultOwner: '0xabCF33106937Ba7f53986F2c339Dd7F1953CE136',
  keeper: '0x340465d9D2EbDE78F15a3870884757584F97aBB4',
  treasurer: treasuryMultisig,
  launchpoolOwner: devMultisig,
  rewardPool: '0x4Aabd0d73181325DD1609Ce696eF048702DE7153',
  treasury: '0xB6Fb58eea08b5539f371A744bb9Ef86283F1B3c2',
  beefyFeeRecipient: '0x6650e6a8A8eD9464B466Fd2fD5d74ffDA4Fd2fab',
  multicall: '0x55f46144bC62e9Af4bAdB71842B62162e2194E90',
  bifiMaxiStrategy: '0x8DB043df791A5D9b640E0919A007994E3635291e',
  voter: '0x5e1caC103F943Cd84A1E92dAde4145664ebf692A',
} as const;
