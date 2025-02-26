import IUniV3PoolAbi from '../abis/IUniV3Pool';
import IKyberElasticPoolAbi from '../abis/IKyberElasticPool';
import IAlgebraPool from '../abis/IAlgebraPool';
import IAlgebraPoolV1 from '../abis/IAlgebraPoolV1';
import IAlgebraPoolV2 from '../abis/IAlgebraPoolV2';
import ISlipstreamPool from '../abis/ISlipstreamPool';
import { ChainId } from '../../packages/address-book/src/types/chainid';
import { fetchContract } from '../api/rpc/client';

type ConcentratedLiquidityToken = {
  type: string;
  oracleId: string;
  decimalDelta: number;
  pool: `0x${string}`;
  firstToken: string;
  secondToken: string;
};

const tokens: Partial<Record<keyof typeof ChainId, ConcentratedLiquidityToken[]>> = {
  ethereum: [
    {
      type: 'Kyber',
      oracleId: 'KNC',
      decimalDelta: 1,
      pool: '0xB5e643250FF59311071C5008f722488543DD7b3C',
      firstToken: 'KNC',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'R',
      decimalDelta: 1e12,
      pool: '0x190ed02adaf1ef8039fcd3f006b42553467d5045',
      firstToken: 'USDC',
      secondToken: 'R',
    },
    {
      type: 'UniV3',
      oracleId: 'AXL',
      decimalDelta: 1,
      pool: '0x5B0d2536F0c970B8d9CBF3959460fb97Ce808Ade',
      firstToken: 'USDC',
      secondToken: 'AXL',
    },
    {
      type: 'UniV3',
      oracleId: 'BIFI',
      decimalDelta: 1,
      pool: '0xfBa26C3F9C8eCeF989def3C5c8aD037487462d83',
      firstToken: 'WETH',
      secondToken: 'BIFI',
    },
    {
      type: 'UniV3',
      oracleId: 'RPL',
      decimalDelta: 1,
      pool: '0xe42318eA3b998e8355a3Da364EB9D48eC725Eb45',
      firstToken: 'RPL',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'GNO',
      decimalDelta: 1,
      pool: '0xf56D08221B5942C428Acc5De8f78489A97fC5599',
      firstToken: 'WETH',
      secondToken: 'GNO',
    },
    {
      type: 'UniV3',
      oracleId: 'weETH',
      decimalDelta: 1,
      pool: '0x7A415B19932c0105c82FDB6b720bb01B0CC2CAe3',
      firstToken: 'weETH',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'COMP',
      decimalDelta: 1,
      pool: '0xea4Ba4CE14fdd287f380b55419B1C5b6c3f22ab6',
      firstToken: 'WETH',
      secondToken: 'COMP',
    },
    {
      type: 'UniV3',
      oracleId: 'SDL',
      decimalDelta: 1,
      pool: '0x51d1026e35d0F9aa0fF243ebC84bb923852c1fC3',
      firstToken: 'SDL',
      secondToken: 'LINK',
    },
    {
      type: 'UniV3',
      oracleId: 'DINERO',
      decimalDelta: 1,
      pool: '0x7138eAe57e8a214F7297E5E67bB6e183dF3572D5',
      firstToken: 'WETH',
      secondToken: 'DINERO',
    },
    {
      type: 'UniV3',
      oracleId: 'EIGEN',
      decimalDelta: 1,
      pool: '0xC2C390c6CD3C4e6c2b70727d35a45e8a072F18cA',
      firstToken: 'EIGEN',
      secondToken: 'WETH',
    },
  ],
  polygon: [
    {
      type: 'UniV3',
      oracleId: 'BAL',
      decimalDelta: 1,
      pool: '0x4fe1269a585B141F11C3E144158f9f8823c7C0e7',
      firstToken: 'BAL',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'RETRO',
      decimalDelta: 1,
      pool: '0x35394eED0Be676ec6470fE6531daD809265310ff',
      firstToken: 'RETRO',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'oRETRO',
      decimalDelta: 1,
      pool: '0x387FBcE5E2933Bd3a7243D0be2aAC8fD9Ab3D55d',
      firstToken: 'RETRO',
      secondToken: 'oRETRO',
    },
    {
      type: 'UniV3',
      oracleId: 'CASH',
      decimalDelta: 1,
      pool: '0x63ca6ED3D390C725b7FEb617BAdcab78a61038E8',
      firstToken: 'CASH',
      secondToken: 'MATIC',
    },
  ],
  arbitrum: [
    {
      type: 'UniV3',
      oracleId: 'GNS',
      decimalDelta: 1,
      pool: '0xC91B7b39BBB2c733f0e7459348FD0c80259c8471',
      firstToken: 'WETH',
      secondToken: 'GNS',
    },
    {
      type: 'UniV3',
      oracleId: 'SVY',
      decimalDelta: 1,
      pool: '0xc3fCF0EF6635f0157f567f92050a23D407976dAa',
      firstToken: 'WETH',
      secondToken: 'SVY',
    },
    {
      type: 'UniV3',
      oracleId: 'oLIT',
      decimalDelta: 1,
      pool: '0xCD744779CAFD693B16A269f2AD6ac69a0E6E5056',
      firstToken: 'WETH',
      secondToken: 'oLIT',
    },
    {
      type: 'UniV3',
      oracleId: 'svETH',
      decimalDelta: 1,
      pool: '0x6a28350341A27e98170b6e8274bF2382B4DAe6AC',
      firstToken: 'svETH',
      secondToken: 'frxETH',
    },
    {
      type: 'UniV3',
      oracleId: 'svUSD',
      decimalDelta: 1,
      pool: '0x28082db75615849D12f37627E614b479749C7903',
      firstToken: 'svUSD',
      secondToken: 'FRAX',
    },
    {
      type: 'AlgebraV1',
      oracleId: 'svBTC',
      decimalDelta: 1e-10,
      pool: '0xA27cb8a8ACf2DE50f3174cb68ec0bD3180D53921',
      firstToken: 'svBTC',
      secondToken: 'WBTC',
    },
    {
      type: 'UniV3',
      oracleId: 'LODE',
      decimalDelta: 1,
      pool: '0xdEb066fE0e7726CbD5d0c4D5A210CfaA16ae1DDA',
      firstToken: 'LODE',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'SILO',
      decimalDelta: 1,
      pool: '0xd3E11119d2680c963F1CDCffeCe0c4adE823Fb58',
      firstToken: 'ETH',
      secondToken: 'SILO',
    },
    {
      type: 'UniV3',
      oracleId: 'arbOVN',
      decimalDelta: 1e12,
      pool: '0x714D48cb99b87F274B33A89fBb16EaD191B40b6C',
      firstToken: 'arbUSD+',
      secondToken: 'arbOVN',
    },
    {
      type: 'AlgebraV1',
      oracleId: 'ORDER',
      decimalDelta: 1,
      pool: '0x256899bD2E99C6736B34caF298719Cc709925819',
      firstToken: 'ETH',
      secondToken: 'ORDER',
    },
  ],
  moonbeam: [
    {
      type: 'UniV3',
      oracleId: 'USDCwh',
      decimalDelta: 1e-12,
      pool: '0xF7e2F39624AAd83AD235A090bE89b5fa861c29B8',
      firstToken: 'GLMR',
      secondToken: 'USDCwh',
    },
    {
      type: 'Algebra',
      oracleId: 'stDOT',
      decimalDelta: 1,
      pool: '0xD9d1064E32704BDd540F90D3A9ecAF037748b966',
      firstToken: 'xcDOT',
      secondToken: 'stDOT',
    },
  ],
  linea: [
    {
      type: 'Algebra',
      oracleId: 'LYNX',
      decimalDelta: 1e-12,
      pool: '0xdDa5Ec5Af00AB99dC80c33E08881EB80C027d498',
      firstToken: 'LYNX',
      secondToken: 'USDC',
    },
    {
      type: 'Algebra',
      oracleId: 'FOXY',
      decimalDelta: 1,
      pool: '0x1Bace56A8C0AE13F5FA08198EabfBA21f6d588D2',
      firstToken: 'ETH',
      secondToken: 'FOXY',
    },
  ],
  real: [
    {
      type: 'UniV3',
      oracleId: 'arcUSD',
      decimalDelta: 1e12,
      pool: '0x22aC4821bBb8d1AC42eA7F0f32ed415F52577Ca1',
      firstToken: 'USDC',
      secondToken: 'arcUSD',
    },
    {
      type: 'UniV3',
      oracleId: 'USTB',
      decimalDelta: 1,
      pool: '0xC6B3AaaAbf2f6eD6cF7fdFFfb0DaC45E10c4A5B3',
      firstToken: 'arcUSD',
      secondToken: 'USTB',
    },
    {
      type: 'UniV3',
      oracleId: 'PEARL',
      decimalDelta: 1e-12,
      pool: '0x374a765309B6D5a123f32971dcA1E6CeF9fa0066',
      firstToken: 'PEARL',
      secondToken: 'USDC',
    },
    {
      type: 'UniV3',
      oracleId: 'CVR',
      decimalDelta: 1,
      pool: '0xfA88A4a7fF6D776c3D0A637095d7a9a4ed813872',
      firstToken: 'PEARL',
      secondToken: 'CVR',
    },
    {
      type: 'UniV3',
      oracleId: 'reETH',
      decimalDelta: 1,
      pool: '0x5dfa942B42841Dd18883838D8F4e5f7d8CEb5Eeb',
      firstToken: 'reETH',
      secondToken: 'USTB',
    },
    {
      type: 'UniV3',
      oracleId: 'RWA',
      decimalDelta: 1,
      pool: '0x182d3F8e154EB43d5f361a39A2234A84508244c9',
      firstToken: 'reETH',
      secondToken: 'RWA',
    },
    {
      type: 'UniV3',
      oracleId: 'UKRE',
      decimalDelta: 1,
      pool: '0x72c20EBBffaE1fe4E9C759b326D97763E218F9F6',
      firstToken: 'arcUSD',
      secondToken: 'UKRE',
    },
  ],
  optimism: [
    {
      type: 'UniV3',
      oracleId: 'uniBTC',
      decimalDelta: 1,
      pool: '0xa5B6d588CEb3aA1BF543d095038479188f884690',
      firstToken: 'uniBTC',
      secondToken: 'WBTC',
    },
  ],
  base: [
    {
      type: 'Slipstream',
      oracleId: 'ODOS',
      decimalDelta: 1e-12,
      pool: '0xb7068556049dF8Fb3ae77CCbb9611FE0e85B2641',
      firstToken: 'ODOS',
      secondToken: 'USDC',
    },
    {
      type: 'Slipstream',
      oracleId: 'basemooBIFI',
      decimalDelta: 1,
      pool: '0xb378137c90444BbceCD44a1f766851fbf53D2a9E',
      firstToken: 'basemooBIFI',
      secondToken: 'ETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'wBLT',
      decimalDelta: 1e12,
      pool: '0x7cE345561E1690445eEfA0dB04F59d64b65598A8',
      firstToken: 'USDC',
      secondToken: 'wBLT',
    },
    {
      type: 'Slipstream',
      oracleId: 'superOETHb',
      decimalDelta: 1,
      pool: '0x6446021F4E396dA3df4235C62537431372195D38',
      firstToken: 'ETH',
      secondToken: 'superOETHb',
    },
    {
      type: 'Slipstream',
      oracleId: 'HarryPotterObamaSonic10Inu',
      decimalDelta: 1e-10,
      pool: '0xfD22D75b2FB405EE185155D57B0277b9DB2F8E29',
      firstToken: 'ETH',
      secondToken: 'HarryPotterObamaSonic10Inu',
    },
    {
      type: 'UniV3',
      oracleId: 'baseLUNA',
      decimalDelta: 1,
      pool: '0x3A3dc4A26d1ACEAE12fD1026a5856F12d20658EA',
      firstToken: 'baseLUNA',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'SPEC',
      decimalDelta: 1,
      pool: '0x8055e6de251e414e8393b20AdAb096AfB3cF8399',
      firstToken: 'SPEC',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'HIGHER',
      decimalDelta: 1,
      pool: '0xCC28456d4Ff980CeE3457Ca809a257E52Cd9CDb0',
      firstToken: 'ETH',
      secondToken: 'HIGHER',
    },
    {
      type: 'UniV3',
      oracleId: 'TALENT',
      decimalDelta: 1,
      pool: '0xAfD8f9B89e2Af8246523573A369010DAF9489B12',
      firstToken: 'TALENT',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'BRETT',
      decimalDelta: 1,
      pool: '0xBA3F945812a83471d709BCe9C3CA699A19FB46f7',
      firstToken: 'BRETT',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'CLANKER',
      decimalDelta: 1,
      pool: '0xC1a6FBeDAe68E1472DbB91FE29B51F7a0Bd44F97',
      firstToken: 'ETH',
      secondToken: 'CLANKER',
    },
    {
      type: 'UniV3',
      oracleId: 'LUM',
      decimalDelta: 1,
      pool: '0x717358A47AC99f3Cd233e723be331756b3951164',
      firstToken: 'ETH',
      secondToken: 'LUM',
    },
    {
      type: 'UniV3',
      oracleId: 'PARADOX',
      decimalDelta: 1,
      pool: '0x9e209Ff07f80E829f417261aEE659771Ce797a7d',
      firstToken: 'ETH',
      secondToken: 'PARADOX',
    },
    {
      type: 'UniV3',
      oracleId: 'ANON',
      decimalDelta: 1,
      pool: '0xc4eCaf115CBcE3985748c58dccfC4722fEf8247c',
      firstToken: 'ETH',
      secondToken: 'ANON',
    },
    {
      type: 'UniV3',
      oracleId: 'MORPHO',
      decimalDelta: 1,
      pool: '0x2F42Df4aF5312B492E9d7F7b2110D9c7bf2D9e4F',
      firstToken: 'MORPHO',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'PUBLIUS',
      decimalDelta: 1,
      pool: '0x6cbCc650ac3D287BaD441F8fCce19aB9CD66c3d5',
      firstToken: 'ETH',
      secondToken: 'PUBLIUS',
    },
    {
      type: 'UniV3',
      oracleId: 'FCAST',
      decimalDelta: 1,
      pool: '0x4Ec1828654b4a28936701D08164721876e88f456',
      firstToken: 'ETH',
      secondToken: 'FCAST',
    },
    {
      type: 'UniV3',
      oracleId: 'SIMMI',
      decimalDelta: 1,
      pool: '0xe9a65059E895DD5D49806f6A71B63FEd0fFffD4B',
      firstToken: 'ETH',
      secondToken: 'SIMMI',
    },
    {
      type: 'UniV3',
      oracleId: 'AIFUN',
      decimalDelta: 1,
      pool: '0x58C10E00c2915F1b12bf08e8b0963b762D509d8E',
      firstToken: 'AIFUN',
      secondToken: 'ETH',
    },
    {
      type: 'UniV3',
      oracleId: 'CHAOS',
      decimalDelta: 1,
      pool: '0x01A1f5758c3a53057B6C819Ec7331e39c167794A',
      firstToken: 'ETH',
      secondToken: 'CHAOS',
    },
    {
      type: 'UniV3',
      oracleId: 'hyUSD',
      decimalDelta: 1,
      pool: '0xDaBfC89ceeF22AD623F57ffe8165531153fE6591',
      firstToken: 'eUSD',
      secondToken: 'hyUSD',
    },
    {
      type: 'Slipstream',
      oracleId: 'uSUI',
      decimalDelta: 1,
      pool: '0x5C45b0F48c326f79b56709d8F63CE2beE7697106',
      firstToken: 'uSUI',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uSOL',
      decimalDelta: 1,
      pool: '0x0225Ba893D5f8Ecd6d2022f9dEC59b34F61098A1',
      firstToken: 'uSOL',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uXRP',
      decimalDelta: 1,
      pool: '0x61C6e9E93592e535Efc1BEE07f491A517e98f6d0',
      firstToken: 'WETH',
      secondToken: 'uXRP',
    },
    {
      type: 'Slipstream',
      oracleId: 'uADA',
      decimalDelta: 1,
      pool: '0xB79C8a96D89f5CCa7B907D3d1229b61373C3D439',
      firstToken: 'uADA',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uLINK',
      decimalDelta: 1,
      pool: '0xFd4F716cb3c493aFDDd40C67d3f42426aEb2d902',
      firstToken: 'uLINK',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uDOGE',
      decimalDelta: 1,
      pool: '0xBE700f5c75dFCbEf3Cae37873aEEB1724daED3f6',
      firstToken: 'WETH',
      secondToken: 'uDOGE',
    },
    {
      type: 'Slipstream',
      oracleId: 'uNEAR',
      decimalDelta: 1,
      pool: '0x864cc817099761c7b7F8228822f2BDe0B74A6588',
      firstToken: 'uNEAR',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uAPT',
      decimalDelta: 1,
      pool: '0xa88C07bD10813CF9B4111DeAb984c4026F2C83bf',
      firstToken: 'uAPT',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'uSEI',
      decimalDelta: 1,
      pool: '0x859c91f9Fe1EC10e38a7CCaD0B87f0aAE0b88cFE',
      firstToken: 'uSEI',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'B3',
      decimalDelta: 1,
      pool: '0xB099C658e784b41EE435d48a8eb67e8f27285C93',
      firstToken: 'B3',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'REI',
      decimalDelta: 1,
      pool: '0xA213C82265cd3D94f972f735A4f5130e34dF81Bc',
      firstToken: 'REI',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'AIXBT',
      decimalDelta: 1e12,
      pool: '0xf1Fdc83c3A336bdbDC9fB06e318B08EadDC82FF4',
      firstToken: 'USDC',
      secondToken: 'AIXBT',
    },
    {
      type: 'Slipstream',
      oracleId: 'uSHIB',
      decimalDelta: 1,
      pool: '0x83212D59403D96A95Fd750d5b6880F77d0CAb337',
      firstToken: 'WETH',
      secondToken: 'uSHIB',
    },
    {
      type: 'Slipstream',
      oracleId: 'uPEPE',
      decimalDelta: 1,
      pool: '0x560c3281CE6cc0f4249c9ED116a8836557CCD1bf',
      firstToken: 'uPEPE',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'POPCAT',
      decimalDelta: 1e-9,
      pool: '0x5D332dC44faC918e66D335fB874FdcDab73560C2',
      firstToken: 'WETH',
      secondToken: 'POPCAT',
    },
    {
      type: 'Slipstream',
      oracleId: 'stTAO',
      decimalDelta: 1e9,
      pool: '0x266f421f80016d670C9de757d561a5C4a6A9FFAc',
      firstToken: 'stTAO',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'NORMUS',
      decimalDelta: 1,
      pool: '0x70C079c33a9F5DAE97bB5085be8155d6dE68BbED',
      firstToken: 'NORMUS',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'KAITO',
      decimalDelta: 1,
      pool: '0x2eA054c177Abd8b8C87704EaA08680DB5C6d805c',
      firstToken: 'KAITO',
      secondToken: 'WETH',
    },
  ],
  zksync: [
    {
      type: 'UniV3',
      oracleId: 'zkXVS',
      decimalDelta: 1,
      pool: '0x4152fDBf1CE1957B6FAFD55737f96A26b787eE9A',
      firstToken: 'zkXVS',
      secondToken: 'WETH',
    },
  ],
  mode: [
    {
      type: 'Slipstream',
      oracleId: 'XVELO',
      decimalDelta: 1,
      pool: '0xc2026f3fb6fc51F4EcAE40a88b4509cB6C143ed4',
      firstToken: 'XVELO',
      secondToken: 'WETH',
    },
    {
      type: 'Slipstream',
      oracleId: 'modesUSDe',
      decimalDelta: 1e12,
      pool: '0xa2E74518fe27B0FC04Ea36024ea837d26cd09CDa',
      firstToken: 'USDC',
      secondToken: 'modesUSDe',
    },
  ],
  lisk: [
    {
      type: 'UniV3',
      oracleId: 'LSK',
      decimalDelta: 1,
      pool: '0xD501d4E381491F64274Cc65fdec32b47264a2422',
      firstToken: 'LSK',
      secondToken: 'WETH',
    },
  ],
  sonic: [
    {
      type: 'AlgebraV2',
      oracleId: 'scBTC',
      decimalDelta: 1,
      pool: '0xb96F401F789271bc14ADe2229E6189084805c50C',
      firstToken: 'scBTC',
      secondToken: 'WBTC',
    },
    {
      type: 'AlgebraV2',
      oracleId: 'sUSDT',
      decimalDelta: 1,
      pool: '0x0d13400CC7c46D77a43957fE614ba58C827dfde6',
      firstToken: 'sUSDT',
      secondToken: 'sUSDCe',
    },
    {
      type: 'AlgebraV2',
      oracleId: 'OS',
      decimalDelta: 1,
      pool: '0xa76Beaf111BaD5dD866fa4835D66b9aA2Eb1FdEc',
      firstToken: 'OS',
      secondToken: 'WS',
    },
    {
      type: 'AlgebraV2',
      oracleId: 'SWPx',
      decimalDelta: 1,
      pool: '0xbeca246a76942502f61bfe88f60bbc87dafefe80',
      firstToken: 'SWPx',
      secondToken: 'WS',
    },
    {
      type: 'UniV3',
      oracleId: 'SHADOW',
      decimalDelta: 1,
      pool: '0x66af3655e14a045F1742b3c9544553Ef7915ed35',
      firstToken: 'stS',
      secondToken: 'SHADOW',
    },
    {
      type: 'UniV3',
      oracleId: 'smooBIFI',
      decimalDelta: 1e-12,
      pool: '0xFD8fc59E65860e7FAaf09482e6Be4af65741DEba',
      firstToken: 'smooBIFI',
      secondToken: 'sUSDCe',
    },
    {
      type: 'UniV3',
      oracleId: 'scETH',
      decimalDelta: 1,
      pool: '0xC291CA0a0a0e793dC6A0442a34E1607Ce1905389',
      firstToken: 'WETH',
      secondToken: 'scETH',
    },
  ],
  berachain: [
    {
      type: 'UniV3',
      oracleId: 'WBERA',
      decimalDelta: 1,
      pool: '0xCda0ca7C3a609773067261D86E817bf777a2870d',
      firstToken: 'WBERA',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'BGT',
      decimalDelta: 1,
      pool: '0xCda0ca7C3a609773067261D86E817bf777a2870d',
      firstToken: 'BGT',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'HONEY',
      decimalDelta: 1,
      pool: '0x9EB897D400f245E151daFD4c81176397D7798C9c',
      firstToken: 'HONEY',
      secondToken: 'WETH',
    },
    {
      type: 'UniV3',
      oracleId: 'iBGT',
      decimalDelta: 1,
      pool: '0x03Ea726B2fcF01C9819A9ECAACc81f3Aa1cBd89B',
      firstToken: 'iBGT',
      secondToken: 'WBERA',
    },
  ],
  bsc: [
    {
      type: 'UniV3',
      oracleId: 'SHELL',
      decimalDelta: 1,
      pool: '0x1D519280255d5D90F469f79dC8f5ABE05F64429f',
      firstToken: 'SHELL',
      secondToken: 'WBNB',
    },
    {
      type: 'UniV3',
      oracleId: 'TST',
      decimalDelta: 1,
      pool: '0x16969FA79651Bae11736F2f6576a86fE2726b42B',
      firstToken: 'WBNB',
      secondToken: 'TST',
    },
    {
      type: 'UniV3',
      oracleId: 'SIREN',
      decimalDelta: 1,
      pool: '0xb2AF49dBF526054FAf19602860A5E298a79F3D05',
      firstToken: 'WBNB',
      secondToken: 'SIREN',
    },
    {
      type: 'UniV3',
      oracleId: 'Broccoli',
      decimalDelta: 1,
      pool: '0xdB25C09d96C165B62F6e6F9d9b17174738d897BA',
      firstToken: 'WBNB',
      secondToken: 'Broccoli',
    },
  ],
};

async function getConcentratedLiquidityPrices(
  tokenPrices: Record<string, number>,
  chainTokens: ConcentratedLiquidityToken[],
  chainId: ChainId
): Promise<number[]> {
  const concentratedLiquidityPriceCalls = chainTokens.map(token => {
    if (token.type == 'Kyber') {
      const tokenContract = fetchContract(token.pool, IKyberElasticPoolAbi, chainId);
      return tokenContract.read.getPoolState();
    } else if (token.type == 'Algebra') {
      const tokenContract = fetchContract(token.pool, IAlgebraPool, chainId);
      return tokenContract.read.globalState();
    } else if (token.type == 'AlgebraV1') {
      const tokenContract = fetchContract(token.pool, IAlgebraPoolV1, chainId);
      return tokenContract.read.globalState();
    } else if (token.type == 'AlgebraV2') {
      const tokenContract = fetchContract(token.pool, IAlgebraPoolV2, chainId);
      return tokenContract.read.globalState();
    } else if (token.type == 'Slipstream') {
      const tokenContract = fetchContract(token.pool, ISlipstreamPool, chainId);
      return tokenContract.read.slot0();
    } else {
      const tokenContract = fetchContract(token.pool, IUniV3PoolAbi, chainId);
      return tokenContract.read.slot0();
    }
  });

  try {
    const res = await Promise.all(concentratedLiquidityPriceCalls);
    const tokenPrice = res.map(v => Number(v[1]));
    const prices = {};
    tokenPrice.forEach((v, i) => {
      const first = chainTokens[i].firstToken;
      const second = chainTokens[i].secondToken;
      prices[chainTokens[i].oracleId] =
        first == chainTokens[i].oracleId
          ? (tokenPrices[second] || prices[second]) / (chainTokens[i].decimalDelta * Math.pow(1.0001, v))
          : (tokenPrices[first] || prices[first]) * (chainTokens[i].decimalDelta * Math.pow(1.0001, v));
    });
    return Object.values(prices);
  } catch (e) {
    console.error('getConcentratedLiquidityPrices', e);
    return chainTokens.map(() => 0);
  }
}

export async function fetchConcentratedLiquidityTokenPrices(tokenPrices): Promise<Record<string, number>> {
  const pricesByChain: Record<string, number>[] = await Promise.all(
    Object.entries(tokens).map(async ([chainId, chainTokens]) => {
      const prices = await getConcentratedLiquidityPrices(tokenPrices, chainTokens, ChainId[chainId]);
      return Object.fromEntries(chainTokens.map((token, i) => [token.oracleId, prices[i] || 0]));
    })
  );

  return Object.assign({}, ...pricesByChain);
}
