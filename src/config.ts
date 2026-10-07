import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import type { Address } from 'viem';

export type AddressBookChain = keyof typeof ChainId;

type RpcEnvKey = `${string}_RPC`;

export type ChainFeature = 'apy' | 'clmApi';

type DisabledChainConfigInput = {
  readonly status: 'disabled';
  /** defaults to the chain key */
  readonly appChain?: string;
};

type EnabledChainConfigInput = {
  /** eol: vaults, prices and tvl are still served; `features` default to off */
  readonly status: 'active' | 'eol';
  /** defaults to the chain key */
  readonly appChain?: string;
  readonly name: string;
  /** each defaults to `featureDefaultByStatus[status]` */
  readonly features?: { readonly [F in ChainFeature]?: boolean };
  /** env var with comma separated rpcs that take priority over `rpcs`; defaults to `${CHAIN}_RPC` */
  readonly rpcEnvKey?: RpcEnvKey;
  /** first rpc is the primary, the rest are fallbacks */
  readonly rpcs: readonly [string, ...string[]];
  readonly explorer: {
    readonly name: string;
    readonly url: string;
  };
  readonly contracts: {
    readonly multicall3: {
      readonly address: Address;
      readonly blockCreated?: number;
    };
    /** BeefyPriceMulticall, required for chains with amm pools */
    readonly beefyPriceMulticall?: Address;
  };
  readonly integrations?: {
    readonly oneInch?: true;
    /** kyberswap chain slug */
    readonly kyber?: string;
    readonly liquidSwap?: true;
    readonly merkl?: true;
    /** dexscreener chain slug */
    readonly dexScreener?: string;
  };
};

type ChainConfigInput = DisabledChainConfigInput | EnabledChainConfigInput;

const featureDefaultByStatus = { active: true, eol: false } as const satisfies Record<
  EnabledChainConfigInput['status'],
  boolean
>;

type DisabledChainConfig = {
  readonly id: AddressBookChain;
  readonly status: 'disabled';
  readonly appChain: string;
};

type EnabledChainConfig = {
  readonly id: AddressBookChain;
  readonly status: 'active' | 'eol';
  readonly appChain: string;
  readonly name: string;
  readonly features: { readonly [F in ChainFeature]: boolean };
  readonly rpcEnvKey: RpcEnvKey;
  readonly rpcs: readonly [string, ...string[]];
  readonly explorer: {
    readonly name: string;
    readonly url: string;
  };
  readonly contracts: {
    readonly multicall3: {
      readonly address: Address;
      readonly blockCreated: number | undefined;
    };
    readonly beefyPriceMulticall: Address | undefined;
  };
  readonly integrations: {
    readonly oneInch: boolean;
    readonly kyber: string | undefined;
    readonly liquidSwap: boolean;
    readonly merkl: boolean;
    readonly dexScreener: string | undefined;
  };
};

type ChainConfig = DisabledChainConfig | EnabledChainConfig;

type AppChainOf<K extends string, T> = T extends { readonly appChain: infer A extends string } ? A : K;

type FeaturesOf<T extends EnabledChainConfigInput> = {
  readonly [F in ChainFeature]: T extends { readonly features: { readonly [P in F]: infer V extends boolean } }
    ? V
    : (typeof featureDefaultByStatus)[T['status']];
};

type ResolvedChainConfigs<T extends Partial<Record<AddressBookChain, ChainConfigInput>>> = {
  readonly [K in keyof T & AddressBookChain]: T[K] extends DisabledChainConfigInput
    ? DisabledChainConfig & { readonly id: K; readonly appChain: AppChainOf<K, T[K]> }
    : T[K] extends EnabledChainConfigInput
      ? EnabledChainConfig & {
          readonly id: K;
          readonly status: T[K]['status'];
          readonly appChain: AppChainOf<K, T[K]>;
          readonly features: FeaturesOf<T[K]>;
        }
      : never;
};

function resolveChainConfig(chain: AddressBookChain, input: ChainConfigInput): ChainConfig {
  if (input.status === 'disabled') {
    return { id: chain, status: input.status, appChain: input.appChain ?? chain };
  }

  const { multicall3, beefyPriceMulticall } = input.contracts;
  const integrations = input.integrations ?? {};
  const featureDefault = featureDefaultByStatus[input.status];
  return {
    id: chain,
    status: input.status,
    appChain: input.appChain ?? chain,
    name: input.name,
    features: {
      apy: input.features?.apy ?? featureDefault,
      clmApi: input.features?.clmApi ?? featureDefault,
    },
    rpcEnvKey: input.rpcEnvKey ?? `${chain.toUpperCase()}_RPC`,
    rpcs: input.rpcs,
    explorer: input.explorer,
    contracts: {
      multicall3: { address: multicall3.address, blockCreated: multicall3.blockCreated },
      beefyPriceMulticall,
    },
    integrations: {
      oneInch: integrations.oneInch ?? false,
      kyber: integrations.kyber,
      liquidSwap: integrations.liquidSwap ?? false,
      merkl: integrations.merkl ?? false,
      dexScreener: integrations.dexScreener,
    },
  };
}

function makeChainConfigs<T extends Partial<Record<AddressBookChain, ChainConfigInput>>>(
  input: T
): ResolvedChainConfigs<T> {
  return Object.fromEntries(
    Object.entries(input).map(([chain, config]) => [chain, resolveChainConfig(chain as AddressBookChain, config)])
  ) as ResolvedChainConfigs<T>;
}

/** @dev only utils/chain.ts should be importing this */
export const chainConfigs = makeChainConfigs({
  polygon: {
    status: 'active',
    name: 'Polygon PoS',
    rpcs: [
      'https://polygon-bor-rpc.publicnode.com',
      'https://polygon.drpc.org',
      'https://gateway.tenderly.co/public/polygon',
      'https://matic.rpc.sentio.xyz',
      'https://polygon.gateway.tenderly.co',
      'https://rpc-polygon.blockmachine.io',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://137.rpc.thirdweb.com',
    ],
    explorer: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 25_770_160 },
      beefyPriceMulticall: '0x2D955C68f8c687242d7475cD0Cc86E6a4A6D968e',
    },
    integrations: { oneInch: true, kyber: 'polygon', merkl: true, dexScreener: 'polygon' },
  },
  bsc: {
    status: 'active',
    name: 'BNB Chain',
    rpcs: [
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://binance.nodereal.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed4.ninicoin.io',
      'https://bsc-dataseed4.bnbchain.org',
      'https://bsc-dataseed1.bnbchain.org',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed.bnbchain.org',
      'https://bsc-dataseed3.bnbchain.org',
      'https://bsc-mainnet.public.blastapi.io',
      'https://bsc-rpc.publicnode.com',
      'https://bsc.rpc.sentio.xyz',
      'https://bsc-dataseed2.bnbchain.org',
      'https://rpc-bsc.blockmachine.io',
      'https://56.rpc.thirdweb.com',
      'https://bsc.rpc.blxrbdn.com',
      'https://rpc-bsc.48.club',
    ],
    explorer: { name: 'BscScan', url: 'https://bscscan.com' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 15_921_452 },
      beefyPriceMulticall: '0xbcf79F67c2d93AD5fd1b919ac4F5613c493ca34F',
    },
    integrations: { oneInch: true, kyber: 'bsc', merkl: true, dexScreener: 'bsc' },
  },
  avax: {
    status: 'active',
    name: 'Avalanche',
    rpcs: [
      'https://api.avax.network/ext/bc/C/rpc',
      'https://avalanche-c-chain-rpc.publicnode.com',
      'https://avalanche-mainnet.gateway.tenderly.co',
      'https://avalanche.rpc.sentio.xyz',
      'https://avax.api.pocket.network',
      'https://avalanche.drpc.org',
      'https://rpc-avalanche.blockmachine.io',
      'https://43114.rpc.thirdweb.com',
      'https://spectrum-01.simplystaking.xyz/avalanche-mn-rpc/ext/bc/C/rpc',
    ],
    explorer: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 11_907_934 },
      beefyPriceMulticall: '0x294d57F60f71036d9C96b008E32744D0909FABbA',
    },
    integrations: { oneInch: true, kyber: 'avalanche', dexScreener: 'avalanche' },
  },
  fantom: { status: 'disabled' },
  heco: { status: 'disabled' },
  one: { status: 'disabled', appChain: 'harmony' },
  arbitrum: {
    status: 'active',
    name: 'Arbitrum',
    rpcs: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum.drpc.org',
      'https://arbitrum-one.public.blastapi.io',
      'https://arbitrum-one.rpc.sentio.xyz',
      'https://arbitrum-one-rpc.publicnode.com',
      'https://rpc-arbitrum.blockmachine.io',
      'https://42161.rpc.thirdweb.com',
      'https://arb-one.api.pocket.network',
      'https://arbitrum.gateway.tenderly.co',
      'https://arb-pokt.nodies.app',
    ],
    explorer: { name: 'Arbitrum Explorer', url: 'https://arbiscan.io' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 7_654_707 },
      beefyPriceMulticall: '0x405EE7F4f067604b787346bC22ACb66b06b15A4B',
    },
    integrations: { oneInch: true, kyber: 'arbitrum', merkl: true, dexScreener: 'arbitrum' },
  },
  celo: { status: 'disabled' },
  moonriver: { status: 'disabled' },
  cronos: { status: 'disabled' },
  aurora: { status: 'disabled' },
  fuse: { status: 'disabled' },
  metis: {
    status: 'eol',
    name: 'Metis',
    rpcs: [
      'https://andromeda.metis.io/?owner=1088',
      'https://metis-rpc.publicnode.com',
      'https://metis-andromeda.gateway.tenderly.co',
      'https://metis.drpc.org',
      'https://metis-andromeda.rpc.thirdweb.com',
      'https://metis-pokt.nodies.app',
    ],
    explorer: { name: 'Metis Explorer', url: 'https://explorer.metis.io' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 2_338_552 },
      beefyPriceMulticall: '0xfcDD5a02C611ba6Fe2802f885281500EC95805d7',
    },
    integrations: { dexScreener: 'metis' },
  },
  moonbeam: { status: 'disabled' },
  emerald: { status: 'disabled' },
  optimism: {
    status: 'active',
    name: 'OP Mainnet',
    rpcs: [
      'https://mainnet.optimism.io',
      'https://optimism-rpc.publicnode.com',
      'https://optimism.public.blockpi.network/v1/rpc/public',
      'https://optimism.rpc.sentio.xyz',
      'https://rpc-optimism.blockmachine.io',
      'https://10.rpc.thirdweb.com',
      'https://optimism.drpc.org',
      'https://op-pokt.nodies.app',
      'https://gateway.tenderly.co/public/optimism',
    ],
    explorer: { name: 'Optimistic Explorer', url: 'https://optimistic.etherscan.io' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 4_286_263 },
      beefyPriceMulticall: '0x13C6bCC2411861A31dcDC2f990ddbe2325482222',
    },
    integrations: { oneInch: true, kyber: 'optimism', merkl: true, dexScreener: 'optimism' },
  },
  kava: { status: 'disabled' },
  ethereum: {
    status: 'active',
    name: 'Ethereum',
    rpcEnvKey: 'ETH_RPC',
    rpcs: [
      'https://ethereum-rpc.publicnode.com',
      'https://ethereum.public.blockpi.network/v1/rpc/public',
      'https://0xrpc.io/eth',
      'https://eth-mainnet.public.blastapi.io',
      'https://eth.drpc.org',
      'https://mainnet.rpc.sentio.xyz',
      'https://eth.api.pocket.network',
      'https://ethereum-json-rpc.stakely.io',
      'https://rpc-eth.blockmachine.io',
      'https://1.rpc.thirdweb.com',
      'https://gateway.tenderly.co/public/mainnet',
      'https://mainnet.gateway.tenderly.co',
      'https://virginia.rpc.blxrbdn.com',
      'https://uk.rpc.blxrbdn.com',
      'https://eth.rpc.blxrbdn.com',
      'https://singapore.rpc.blxrbdn.com',
      'https://eth-pokt.nodies.app',
      'https://rpc.flashbots.net',
      'https://rpc.flashbots.net/fast',
      'https://rpc.mevblocker.io',
      'https://rpc.mevblocker.io/fast',
      'https://rpc.mevblocker.io/noreverts',
      'https://rpc.mevblocker.io/fullprivacy',
    ],
    explorer: { name: 'Etherscan', url: 'https://etherscan.io' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11', blockCreated: 14_353_601 },
      beefyPriceMulticall: '0x9D55cAEE108aBdd4C47E42088C97ecA43510E969',
    },
    integrations: { oneInch: true, kyber: 'ethereum', merkl: true, dexScreener: 'ethereum' },
  },
  canto: { status: 'disabled' },
  zksync: {
    status: 'eol',
    name: 'zkSync',
    rpcs: [
      'https://mainnet.era.zksync.io',
      'https://zksync.drpc.org',
      'https://zksync-era.rpc.sentio.xyz',
      'https://zksync-era.api.pocket.network',
      'https://324.rpc.thirdweb.com',
    ],
    explorer: { name: 'zkSync Explorer', url: 'https://explorer.zksync.io' },
    contracts: {
      multicall3: { address: '0x9A04a9e1d67151AB1E742E6D8965e0602410f91d' },
      beefyPriceMulticall: '0x8BBbA444553e149968A52f46d1294C280C1458B6',
    },
    integrations: { oneInch: true, dexScreener: 'zksync' },
  },
  zkevm: { status: 'disabled' },
  base: {
    status: 'active',
    name: 'Base',
    rpcs: [
      'https://base-mainnet.public.blastapi.io',
      'https://gateway.tenderly.co/public/base',
      'https://base-rpc.publicnode.com',
      'https://base.public.blockpi.network/v1/rpc/public',
      'https://base.rpc.sentio.xyz',
      'https://rpc.baseazul.dev',
      'https://8453.rpc.thirdweb.com',
      'https://mainnet.base.org',
      'https://developer-access-mainnet.base.org',
      'https://base-pokt.nodies.app',
      'https://base.gateway.tenderly.co',
      'https://base.drpc.org',
    ],
    explorer: { name: 'Base Explorer', url: 'https://basescan.org/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x3AA76f4aD5cc43E530a6C51c8eb13c40a3753aae',
    },
    integrations: { oneInch: true, kyber: 'base', merkl: true, dexScreener: 'base' },
  },
  gnosis: {
    status: 'eol',
    name: 'Gnosis',
    rpcs: [
      'https://rpc.gnosischain.com',
      'https://rpc.ap-southeast-1.gateway.fm/v4/gnosis/non-archival/mainnet',
      'https://rpc.gnosis.gateway.fm',
      'https://gnosis.drpc.org',
      'https://gnosis-rpc.publicnode.com',
      'https://100.rpc.thirdweb.com',
      'https://gnosis.api.pocket.network',
      'https://gnosis.oat.farm',
    ],
    explorer: { name: 'Gnosis Explorer', url: 'https://gnosisscan.io/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x07f1ad98b725Af45485646aC431b7757f50C598A',
    },
    integrations: { oneInch: true, dexScreener: 'gnosischain' },
  },
  linea: {
    status: 'eol',
    name: 'Linea',
    rpcs: [
      'https://rpc.linea.build',
      'https://linea-rpc.publicnode.com',
      'https://linea.rpc.sentio.xyz',
      'https://linea.api.pocket.network',
      'https://linea.drpc.org',
      'https://59144.rpc.thirdweb.com',
    ],
    explorer: { name: 'Linea Explorer', url: 'https://explorer.linea.build/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xe103ab2f922aa1a56EC058AbfDA2CeEa1e95bCd7',
    },
    integrations: { oneInch: true, kyber: 'linea', dexScreener: 'linea' },
  },
  mantle: {
    status: 'eol',
    name: 'Mantle',
    rpcs: [
      'https://rpc.mantle.xyz',
      'https://mantle-rpc.publicnode.com',
      'https://mantle.drpc.org',
      'https://rpc-mantle.blockmachine.io',
      'https://5000.rpc.thirdweb.com',
    ],
    explorer: { name: 'Mantle Explorer', url: 'https://mantlescan.info/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xee59DE6E749cc6cF6ebD30878D8B4222C4aea37C',
    },
    integrations: { kyber: 'mantle', dexScreener: 'mantle' },
  },
  fraxtal: {
    status: 'active',
    name: 'Fraxtal',
    features: {
      clmApi: false,
    },
    rpcs: [
      'https://rpc.frax.com',
      'https://fraxtal-rpc.publicnode.com',
      'https://fraxtal.gateway.tenderly.co',
      'https://fraxtal.api.pocket.network',
      'https://fraxtal.drpc.org',
      'https://frax-mainnet.rpc.sentio.xyz',
      'https://252.rpc.thirdweb.com',
    ],
    explorer: { name: 'Fraxtal Explorer', url: 'https://fraxscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xBC4a342B0c057501E081484A2d24e576E854F823',
    },
  },
  mode: { status: 'disabled' },
  manta: { status: 'disabled' },
  real: { status: 'disabled' },
  sei: {
    status: 'eol',
    name: 'Sei',
    rpcs: ['https://evm-rpc.sei-apis.com', 'https://sei-evm-rpc.stakeme.pro', 'https://1329.rpc.thirdweb.com'],
    explorer: { name: 'Sei Explorer', url: 'https://seitrace.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xD535BDbc82cc04Ccc360E9f948cD8F9f76084088',
    },
  },
  rootstock: { status: 'disabled' },
  scroll: { status: 'disabled' },
  lisk: {
    status: 'eol',
    name: 'Lisk',
    rpcs: [
      'https://rpc.api.lisk.com',
      'https://lisk.gateway.tenderly.co',
      'https://lisk.drpc.org',
      'https://1135.rpc.thirdweb.com',
    ],
    explorer: { name: 'Lisk Explorer', url: 'https://blockscout.lisk.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x679d78307720CCdDFf572cc56E3C35F9861033Bc',
    },
  },
  sonic: {
    status: 'eol',
    name: 'Sonic',
    rpcs: [
      'https://rpc.soniclabs.com',
      'https://sonic-rpc.publicnode.com',
      'https://sonic-mainnet.rpc.sentio.xyz',
      'https://sonic.drpc.org',
      'https://146.rpc.thirdweb.com',
      'https://sonic-json-rpc.stakely.io',
    ],
    explorer: { name: 'Sonic Explorer', url: 'https://sonicscan.org/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E',
    },
    integrations: { oneInch: true, kyber: 'sonic', merkl: true, dexScreener: 'sonic' },
  },
  berachain: {
    status: 'eol',
    name: 'Berachain',
    rpcs: [
      'https://rpc.berachain.com',
      'https://berachain-rpc.publicnode.com',
      'https://rpc.berachain-apis.com',
      'https://berachain.rpc.sentio.xyz',
      'https://berachain.drpc.org',
      'https://rpc.swiftnodes.io/rpc/berachain',
      'https://80094.rpc.thirdweb.com',
      'https://bera.api.pocket.network',
    ],
    explorer: { name: 'Berachain Explorer', url: 'https://berachainscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
    integrations: { kyber: 'berachain' },
  },
  unichain: { status: 'disabled' },
  saga: { status: 'disabled' },
  hyperevm: {
    status: 'active',
    name: 'HyperEVM',
    rpcs: [
      'https://hyperevm.rpc.sentio.xyz',
      'https://rpc.hyperlend.finance',
      'https://hyperliquid.drpc.org',
      'https://rpc.hyperliquid.xyz/evm',
      'https://hyperliquid-json-rpc.stakely.io',
      'https://rpc.hypurrscan.io',
      'https://999.rpc.thirdweb.com',
    ],
    explorer: { name: 'Hyperevm Explorer', url: 'https://www.hyperscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x99D7d8b7d4873F277CEDc7e1F4eDE57f4747e003',
    },
    integrations: { oneInch: true, kyber: 'hyperevm', liquidSwap: true, merkl: true },
  },
  plasma: {
    status: 'active',
    name: 'Plasma',
    rpcs: ['https://rpc.plasma.to', 'https://rpc.swiftnodes.io/rpc/plasma', 'https://9745.rpc.thirdweb.com'],
    explorer: { name: 'Plasma Explorer', url: 'https://plasmascan.to/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xd32C07b78ee7e02393f020eAbdd40fE2cCe20bf7',
    },
    integrations: { kyber: 'plasma', merkl: true, dexScreener: 'plasma' },
  },
  monad: {
    status: 'active',
    name: 'Monad',
    rpcs: [
      'https://rpc1.monad.xyz',
      'https://rpc.monad.xyz',
      'https://rpc3.monad.xyz',
      'https://monad-mainnet.rpc.sentio.xyz',
      'https://monad-rpc.huginn.tech',
      'https://infra.originstake.com/monad/evm',
      'https://monad-mainnet-rpc.spidernode.net',
      'https://rpc4.monad.xyz',
      'https://143.rpc.thirdweb.com',
      'https://rpc-mainnet.monadinfra.com',
    ],
    explorer: { name: 'Monad Explorer', url: 'https://monadscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x52A225f89a4AF9b24b00d4b52F3e7a72B7Fca75B',
    },
    integrations: { oneInch: true, kyber: 'monad', merkl: true },
  },
  megaeth: {
    status: 'active',
    name: 'MegaETH',
    rpcs: [
      'https://mainnet.megaeth.com/rpc',
      'https://megaeth.drpc.org',
      'https://megaeth.rpc.sentio.xyz',
      'https://rpc-megaeth-mainnet.globalstake.io',
    ],
    explorer: { name: 'Megaeth Explorer', url: 'https://mega.etherscan.io/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
    integrations: { kyber: 'megaeth', merkl: true },
  },
  robinhood: {
    status: 'active',
    name: 'Robinhood',
    rpcs: [
      'https://rpc.mainnet.chain.robinhood.com',
      'https://rpc.ordofi.network',
      'https://robinhood-rpc.publicnode.com',
      'https://rpc-robinhood.blockmachine.io',
    ],
    explorer: { name: 'robinhood explorer', url: 'https://robinhoodchain.blockscout.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x43Cf4f684Ec0bcB5f09Bbf1851E693FF0b24cDd6',
    },
    integrations: { oneInch: true, kyber: 'robinhood', merkl: true },
  },
  arc: {
    status: 'active',
    name: 'Arc',
    rpcs: [
      'https://rpc.mainnet.arc.io',
      'https://rpc.beamrpc.com',
      'https://rpc.drpc.mainnet.arc.io',
      'https://rpc.blockdaemon.mainnet.arc.io',
      'https://rpc.quicknode.mainnet.arc.io',
    ],
    explorer: { name: 'arc explorer', url: 'https://arc.etherscan.io/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
    integrations: { oneInch: true, kyber: 'arc', merkl: true },
  },
} as const satisfies Partial<Record<AddressBookChain, ChainConfigInput>>);

type MissingChainConfig = Exclude<AddressBookChain, keyof typeof chainConfigs>;
/** fails to compile when an address book chain has no entry in `chainConfigs` */
export type AllChainsConfigured<T extends never = MissingChainConfig> = T;
