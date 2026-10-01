import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import type { Address } from 'viem';

export type AddressBookChain = keyof typeof ChainId;

type RpcEnvKey = `${string}_RPC`;

export type ChainFeature = 'apy' | 'clmApi';

type DisabledChainConfigInput = {
  readonly status: 'disabled';
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
    ? DisabledChainConfig & { readonly id: K }
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
    return { id: chain, status: input.status };
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
    name: 'Polygon',
    rpcs: [
      'https://polygon-rpc.com/',
      'https://polygon.llamarpc.com',
      'https://rpc.ankr.com/polygon',
      'https://polygon.rpc.blxrbdn.com',
      'https://polygon-mainnet.public.blastapi.io',
      'https://polygon-bor.publicnode.com',
      'https://rpc-mainnet.matic.quiknode.pro',
      'https://rpc-mainnet.maticvigil.com',
      'https://polygon-pokt.nodies.app',
      'https://polygon.blockpi.network/v1/rpc/public',
      'https://polygon.meowrpc.com',
      'https://1rpc.io/matic',
      'https://api.zan.top/node/v1/polygon/mainnet/public',
      'https://gateway.tenderly.co/public/polygon',
      'https://polygon.drpc.org',
      'https://polygon.api.onfinality.io/public',
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
    name: 'BNBChain',
    rpcs: [
      'https://bsc-dataseed.bnbchain.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'https://bsc-dataseed1.bnbchain.org',
      'https://bsc-dataseed2.bnbchain.org',
      'https://bsc-dataseed3.bnbchain.org',
      'https://bsc-dataseed4.bnbchain.org',
      'https://binance.llamarpc.com',
      'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
      'https://binance.nodereal.io',
      'https://bsc.rpc.blxrbdn.com',
      'https://bsc.blockpi.network/v1/rpc/public',
      'https://bsc-pokt.nodies.app',
      'https://bsc.publicnode.com',
      'https://bsc-mainnet.public.blastapi.io',
      'https://bsc.meowrpc.com',
      'https://1rpc.io/bnb',
      'https://koge-rpc-bsc.48.club',
      'https://rpc-bsc.48.club',
      'https://api.zan.top/node/v1/bsc/mainnet/public',
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
      'https://avalanche-public.nodies.app/ext/bc/C/rpc',
      'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
      'https://avalanche.public-rpc.com',
      'https://avalanche.blockpi.network/v1/rpc/public',
      'https://api.avax.network/ext/bc/C/rpc',
      'https://rpc.ankr.com/avalanche',
      'https://avax-pokt.nodies.app/ext/bc/C/rpc',
      'https://avax.meowrpc.com',
      'https://1rpc.io/avax/c',
      'https://api.zan.top/node/v1/avax/mainnet/public/ext/bc/C/rpc',
      'https://avalanche-c-chain.publicnode.com',
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
  one: { status: 'disabled' },
  arbitrum: {
    status: 'active',
    name: 'Arbitrum',
    rpcs: [
      'https://arbitrum.gateway.tenderly.co',
      'https://arbitrum.llamarpc.com',
      'https://endpoints.omniatech.io/v1/arbitrum/one/public',
      'https://arbitrum-one.public.blastapi.io',
      'https://arb-mainnet-public.unifra.io',
      'https://arbitrum.drpc.org',
      'https://rpc.arb1.arbitrum.gateway.fm',
      'https://arbitrum-one.publicnode.com',
      'https://arbitrum.meowrpc.com',
      'https://arb-pokt.nodies.app',
      'https://arbitrum.blockpi.network/v1/rpc/public',
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
      'https://metis-mainnet.public.blastapi.io',
      'https://andromeda.metis.io/?owner=1088',
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
    name: 'Optimism',
    rpcs: [
      'https://optimism-rpc.publicnode.com',
      'https://optimism.llamarpc.com',
      'https://endpoints.omniatech.io/v1/op/mainnet/public',
      'https://rpc.ankr.com/optimism',
      'https://optimism.blockpi.network/v1/rpc/public',
      'https://op-pokt.nodies.app',
      'https://gateway.tenderly.co/public/optimism',
      'https://optimism.drpc.org',
      'https://rpc.optimism.gateway.fm',
      'https://optimism.meowrpc.com',
      'https://mainnet.optimism.io',
      'https://api.zan.top/node/v1/opt/mainnet/public',
      'https://optimism.publicnode.com',
      'https://optimism-mainnet.public.blastapi.io',
      'https://1rpc.io/op',
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
      'https://rpc.eth.gateway.fm',
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://virginia.rpc.blxrbdn.com',
      'https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7',
      'https://uk.rpc.blxrbdn.com',
      'https://eth.rpc.blxrbdn.com',
      'https://singapore.rpc.blxrbdn.com',
      'https://ethereum.publicnode.com',
      'https://eth-pokt.nodies.app',
      'https://eth.merkle.io',
      'https://api.zmok.io/mainnet/oaen6dy8ff6hju9k',
      'https://gateway.tenderly.co/public/mainnet',
      'https://rpc.flashbots.net',
      'https://eth-mainnet.public.blastapi.io',
      'https://mainnet.gateway.tenderly.co',
      'https://rpc.flashbots.net/fast',
      'https://rpc.mevblocker.io',
      'https://api.securerpc.com/v1',
      'https://rpc.notadegen.com/eth',
      'https://go.getblock.io/d7dab8149ec04390aaa923ff2768f914',
      'https://rpc.mevblocker.io/fast',
      'https://cloudflare-eth.com',
      'https://rpc.mevblocker.io/noreverts',
      'https://eth.drpc.org',
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
      'https://zksync-era.blockpi.network/v1/rpc/public',
      'https://1rpc.io/zksync2-era',
      'https://zksync.meowrpc.com',
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
      'https://endpoints.omniatech.io/v1/base/mainnet/public',
      'https://mainnet.base.org',
      'https://developer-access-mainnet.base.org',
      'https://base-pokt.nodies.app',
      'https://base.gateway.tenderly.co',
      'https://base.blockpi.network/v1/rpc/public',
      'https://base.meowrpc.com',
      'https://rpc.notadegen.com/base',
      'https://base.drpc.org',
      'https://base.publicnode.com',
      'https://1rpc.io/base',
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
      'https://gnosis.publicnode.com',
      'https://rpc.ankr.com/gnosis',
      'https://gnosis.oat.farm',
      'https://gnosis-mainnet.public.blastapi.io',
      'https://gnosis-pokt.nodies.app',
      'https://gnosis.drpc.org',
      'https://gnosis.blockpi.network/v1/rpc/public',
      'https://1rpc.io/gnosis',
      'https://rpc.ap-southeast-1.gateway.fm/v4/gnosis/non-archival/mainnet',
      'https://endpoints.omniatech.io/v1/gnosis/mainnet/public',
      'https://rpc.gnosischain.com',
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
      'https://linea.blockpi.network/v1/rpc/public',
      'https://1rpc.io/linea',
      'https://linea.drpc.org',
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
    rpcs: ['https://rpc.mantle.xyz', 'https://rpc.ankr.com/mantle', 'https://1rpc.io/mantle'],
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
    rpcs: ['https://rpc.frax.com'],
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
    rpcs: ['https://sei-public.nodies.app', 'https://evm-rpc.sei-apis.com'],
    explorer: { name: 'sei explorer', url: 'https://seitrace.com/' },
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
    rpcs: ['https://rpc.api.lisk.com'],
    explorer: { name: 'lisk explorer', url: 'https://blockscout.lisk.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x679d78307720CCdDFf572cc56E3C35F9861033Bc',
    },
  },
  sonic: {
    status: 'active',
    name: 'Sonic',
    rpcs: ['https://rpc.soniclabs.com'],
    explorer: { name: 'sonic explorer', url: 'https://sonicscan.org/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xf2068e1FE1A80E7f5Ba80D6ABD6e8618aD4E959E',
    },
    integrations: { oneInch: true, kyber: 'sonic', merkl: true, dexScreener: 'sonic' },
  },
  berachain: {
    status: 'eol',
    name: 'Bera',
    rpcs: ['https://rpc.berachain.com'],
    explorer: { name: 'berachain explorer', url: 'https://berachainscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
    integrations: { kyber: 'berachain' },
  },
  unichain: { status: 'disabled' },
  saga: { status: 'disabled' },
  hyperevm: {
    status: 'active',
    name: 'Hyperevm',
    rpcs: ['https://rpc.hyperliquid.xyz/evm'],
    explorer: { name: 'hyperevm explorer', url: 'https://www.hyperscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x99D7d8b7d4873F277CEDc7e1F4eDE57f4747e003',
    },
    integrations: { oneInch: true, kyber: 'hyperevm', liquidSwap: true, merkl: true },
  },
  plasma: {
    status: 'active',
    name: 'Plasma',
    rpcs: ['https://rpc.plasma.to'],
    explorer: { name: 'plasma explorer', url: 'https://plasmascan.to/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0xd32C07b78ee7e02393f020eAbdd40fE2cCe20bf7',
    },
    integrations: { kyber: 'plasma', merkl: true, dexScreener: 'plasma' },
  },
  monad: {
    status: 'active',
    name: 'Monad',
    rpcs: ['https://rpc-mainnet.monadinfra.com'],
    explorer: { name: 'monad explorer', url: 'https://monadscan.com/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
      beefyPriceMulticall: '0x52A225f89a4AF9b24b00d4b52F3e7a72B7Fca75B',
    },
    integrations: { oneInch: true, kyber: 'monad', merkl: true },
  },
  megaeth: {
    status: 'active',
    name: 'MegaETH',
    rpcs: ['https://mainnet.megaeth.com/rpc'],
    explorer: { name: 'megaeth explorer', url: 'https://mega.etherscan.io/' },
    contracts: {
      multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
    },
    integrations: { kyber: 'megaeth', merkl: true },
  },
  robinhood: {
    status: 'active',
    name: 'Robinhood',
    rpcs: ['https://rpc.mainnet.chain.robinhood.com'],
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
    rpcs: ['https://rpc.mainnet.arc.io'],
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
