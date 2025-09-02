import { ChainId } from '../packages/address-book/src/address-book';
import { ApiChain, fromChainId, toChainId } from './utils/chain';
import { mapValues, shuffle, uniq } from 'lodash';
import { getChainRpcs } from './api/rpc/rpcs';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const BASE_HPY = 2190;
const MINUTELY_HPY = 525600;
const HOURLY_HPY = 8760;
const DAILY_HPY = 365;
const ETH_HPY = DAILY_HPY / 3;
const WEEKLY_HPY = 52;

type ApiChainToRpcs = Readonly<Record<ApiChain, ReadonlyArray<string>>>;

// FIXME we should only have one list of rpcs
const DEFAULT_RPCS: ApiChainToRpcs = {
  bsc: [
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
  ],
  heco: ['https://128.rpc.thirdweb.com/'],
  avax: ['https://rpc.ankr.com/avalanche'],
  polygon: ['https://polygon-rpc.com/'],
  fantom: ['https://fantom-mainnet.public.blastapi.io'],
  one: ['https://api.harmony.one/'],
  arbitrum: ['https://arbitrum.public.blockpi.network/v1/rpc/public'],
  celo: ['https://forno.celo.org'],
  moonriver: ['https://rpc.api.moonriver.moonbeam.network'],
  cronos: ['https://cronos-evm-rpc.publicnode.com'],
  aurora: ['https://mainnet.aurora.dev/Fon6fPMs5rCdJc4mxX4kiSK1vsKdzc3D8k6UF8aruek'],
  fuse: ['https://rpc.fuse.io'],
  metis: ['https://metis-mainnet.public.blastapi.io'],
  moonbeam: ['https://rpc.api.moonbeam.network'],
  emerald: ['https://emerald.oasis.dev'],
  optimism: ['https://optimism.drpc.org'],
  kava: ['https://kava-evm.publicnode.com'],
  ethereum: ['https://eth.llamarpc.com'],
  canto: ['https://canto-rpc.ansybl.io'],
  zksync: ['https://mainnet.era.zksync.io'],
  zkevm: ['https://zkevm-rpc.com'],
  base: ['https://base-mainnet.public.blastapi.io'],
  gnosis: ['https://gnosis.publicnode.com'],
  linea: ['https://rpc.linea.build'],
  mantle: ['https://rpc.mantle.xyz'],
  fraxtal: ['https://rpc.frax.com'],
  mode: ['https://mode.drpc.org'],
  manta: ['https://1rpc.io/manta'],
  real: ['https://rpc.realforreal.gelato.digital'],
  sei: ['https://evm-rpc.sei-apis.com'],
  rootstock: ['https://rootstock-mainnet.public.blastapi.io'],
  scroll: ['https://rpc.scroll.io'],
  lisk: ['https://rpc.api.lisk.com'],
  sonic: ['https://rpc.soniclabs.com'],
  berachain: ['https://rpc.berachain.com'],
  unichain: ['https://mainnet.unichain.org'],
  saga: ['https://sagaevm.jsonrpc.sagarpc.io'],
  hyperevm: ['https://rpc.hyperliquid.xyz/evm'],
} as const;

const chainToRpcEnvKeyPrefix = {
  ethereum: 'ETH',
} as const satisfies Partial<Record<ApiChain, string>>;

type ApiChainToRpcEnvKeyPrefix = typeof chainToRpcEnvKeyPrefix;
type ApiChainToRpcEnvKey<T extends ApiChain> = {
  [K in T]: `${Uppercase<
    ApiChainToRpcEnvKeyPrefix extends { [P in K]: string } ? ApiChainToRpcEnvKeyPrefix[K] : K
  >}_RPC`;
}[T];

type EnvChainToRpc = Readonly<{
  [K in ApiChain as ApiChainToRpcEnvKey<K>]: string;
}>;

type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

const getRpcEnvKey = <T extends ApiChain>(chain: T): ApiChainToRpcEnvKey<T> => {
  const prefix = ((chainToRpcEnvKeyPrefix as Record<ApiChain, string>)[chain] || chain).toUpperCase();
  return `${prefix}_RPC` as ApiChainToRpcEnvKey<T>;
};

const getRpcsFromEnv = (chain: ApiChain): string[] => {
  const envKey = getRpcEnvKey(chain);
  const envValue = process.env[envKey];
  if (envValue) {
    return envValue.split(',').map(url => url.trim());
  }
  return [];
};

const RPCS_BY_CHAIN = mapValues(DEFAULT_RPCS, (hereDefaultRpcs, chain: ApiChain) => {
  const customRpcs = getRpcsFromEnv(chain);
  const otherDefaultRpcs = getChainRpcs(toChainId(chain));
  // FIXME we should only have one list of rpcs
  return uniq([...customRpcs, ...hereDefaultRpcs, ...otherDefaultRpcs]) as ReadonlyArray<string>;
});

const RPC_BY_ENV_KEY = Object.entries(RPCS_BY_CHAIN).reduce(
  (acc, [chainId, rpcs]: [ApiChain, ReadonlyArray<string>]) => {
    const key = getRpcEnvKey(chainId);
    acc[key] = rpcs[0];
    return acc;
  },
  {} as Writable<EnvChainToRpc>
) as EnvChainToRpc;

/// Chain IDs
const BSC_CHAIN_ID = ChainId.bsc;
const HECO_CHAIN_ID = ChainId.heco;
const POLYGON_CHAIN_ID = ChainId.polygon;
const AVAX_CHAIN_ID = ChainId.avax;
const FANTOM_CHAIN_ID = ChainId.fantom;
const ONE_CHAIN_ID = ChainId.one;
const ARBITRUM_CHAIN_ID = ChainId.arbitrum;
const CELO_CHAIN_ID = ChainId.celo;
const MOONRIVER_CHAIN_ID = ChainId.moonriver;
const CRONOS_CHAIN_ID = ChainId.cronos;
const AURORA_CHAIN_ID = ChainId.aurora;
const FUSE_CHAIN_ID = ChainId.fuse;
const METIS_CHAIN_ID = ChainId.metis;
const MOONBEAM_CHAIN_ID = ChainId.moonbeam;
const EMERALD_CHAIN_ID = ChainId.emerald;
const OPTIMISM_CHAIN_ID = ChainId.optimism;
const KAVA_CHAIN_ID = ChainId.kava;
const ETH_CHAIN_ID = ChainId.ethereum;
const CANTO_CHAIN_ID = ChainId.canto;
const ZKSYNC_CHAIN_ID = ChainId.zksync;
const ZKEVM_CHAIN_ID = ChainId.zkevm;
const BASE_CHAIN_ID = ChainId.base;
const GNOSIS_CHAIN_ID = ChainId.gnosis;
const LINEA_CHAIN_ID = ChainId.linea;
const MANTLE_CHAIN_ID = ChainId.mantle;
const FRAXTAL_CHAIN_ID = ChainId.fraxtal;
const MODE_CHAIN_ID = ChainId.mode;
const MANTA_CHAIN_ID = ChainId.manta;
const REAL_CHAIN_ID = ChainId.real;
const SEI_CHAIN_ID = ChainId.sei;
const ROOTSTOCK_CHAIN_ID = ChainId.rootstock;
const SCROLL_CHAIN_ID = ChainId.scroll;
const LISK_CHAIN_ID = ChainId.lisk;
const SONIC_CHAIN_ID = ChainId.sonic;
const BERACHAIN_CHAIN_ID = ChainId.berachain;
const UNICHAIN_CHAIN_ID = ChainId.unichain;
const SAGA_CHAIN_ID = ChainId.saga;
const HYPEREVM_CHAIN_ID = ChainId.hyperevm;

/// LP Fee
const SUSHI_LPF = 0.003;
const PCS_LPF = 0.0017;
const SPOOKY_LPF = 0.002;
const JOE_LPF = 0.003;
const SOLAR_LPF = 0.0025;
const FUSEFI_LPF = 0.003;
const NET_LPF = 0.003;
const PANGOLIN_LPF = 0.003;
const TETHYS_LPF = 0.002;
const BEAMSWAP_LPF = 0.0017;
const BISWAP_LPF = 0.0005;
const HOP_LPF = 0.0004;

const MULTICHAIN_RPC: Record<ChainId, string> = Object.fromEntries(
  Object.entries(RPCS_BY_CHAIN).map(([key, value]: [ApiChain, string[]]) => [ChainId[key], value[0]])
) as Record<ChainId, string>;

/// Beefy Vaults Endpoints
const BSC_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/bsc.json';
const HECO_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/heco.json';
const AVAX_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/avax.json';
const POLYGON_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/polygon.json';
const FANTOM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/fantom.json';
const ONE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/harmony.json';
const ARBITRUM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/arbitrum.json';
const CELO_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/celo.json';
const MOONRIVER_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/moonriver.json';
const CRONOS_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/cronos.json';
const AURORA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/aurora.json';
const FUSE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/fuse.json';
const METIS_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/metis.json';
const MOONBEAM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/moonbeam.json';
const EMERALD_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/emerald.json';
const OPTIMISM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/optimism.json';
const KAVA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/kava.json';
const ETHEREUM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/ethereum.json';
const CANTO_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/canto.json';
const ZKSYNC_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/zksync.json';
const ZKEVM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/zkevm.json';
const BASE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/base.json';
const GNOSIS_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/gnosis.json';
const LINEA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/linea.json';
const MANTLE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/mantle.json';
const FRAXTAL_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/fraxtal.json';
const MODE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/mode.json';
const MANTA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/manta.json';
const REAL_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/real.json';
const SEI_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/sei.json';
const ROOTSTOCK_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/rootstock.json';
const SCROLL_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/scroll.json';
const LISK_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/lisk.json';
const SONIC_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/sonic.json';
const BERACHAIN_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/berachain.json';
const UNICHAIN_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/unichain.json';
const SAGA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/saga.json';
const HYPEREVM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/vault/hyperevm.json';

const MULTICHAIN_ENDPOINTS: Partial<Record<ApiChain, string>> = {
  bsc: BSC_VAULTS_ENDPOINT,
  avax: AVAX_VAULTS_ENDPOINT,
  polygon: POLYGON_VAULTS_ENDPOINT,
  fantom: FANTOM_VAULTS_ENDPOINT,
  one: ONE_VAULTS_ENDPOINT,
  arbitrum: ARBITRUM_VAULTS_ENDPOINT,
  celo: CELO_VAULTS_ENDPOINT,
  moonriver: MOONRIVER_VAULTS_ENDPOINT,
  cronos: CRONOS_VAULTS_ENDPOINT,
  aurora: AURORA_VAULTS_ENDPOINT,
  fuse: FUSE_VAULTS_ENDPOINT,
  metis: METIS_VAULTS_ENDPOINT,
  moonbeam: MOONBEAM_VAULTS_ENDPOINT,
  emerald: EMERALD_VAULTS_ENDPOINT,
  optimism: OPTIMISM_VAULTS_ENDPOINT,
  heco: HECO_VAULTS_ENDPOINT,
  kava: KAVA_VAULTS_ENDPOINT,
  ethereum: ETHEREUM_VAULTS_ENDPOINT,
  canto: CANTO_VAULTS_ENDPOINT,
  zksync: ZKSYNC_VAULTS_ENDPOINT,
  zkevm: ZKEVM_VAULTS_ENDPOINT,
  base: BASE_VAULTS_ENDPOINT,
  gnosis: GNOSIS_VAULTS_ENDPOINT,
  linea: LINEA_VAULTS_ENDPOINT,
  mantle: MANTLE_VAULTS_ENDPOINT,
  fraxtal: FRAXTAL_VAULTS_ENDPOINT,
  mode: MODE_VAULTS_ENDPOINT,
  manta: MANTA_VAULTS_ENDPOINT,
  real: REAL_VAULTS_ENDPOINT,
  sei: SEI_VAULTS_ENDPOINT,
  rootstock: ROOTSTOCK_VAULTS_ENDPOINT,
  scroll: SCROLL_VAULTS_ENDPOINT,
  lisk: LISK_VAULTS_ENDPOINT,
  sonic: SONIC_VAULTS_ENDPOINT,
  berachain: BERACHAIN_VAULTS_ENDPOINT,
  unichain: UNICHAIN_VAULTS_ENDPOINT,
  saga: SAGA_VAULTS_ENDPOINT,
  hyperevm: HYPEREVM_VAULTS_ENDPOINT,
} as const;

const EXCLUDED_IDS_FROM_TVL = ['venus-wbnb'];

/**
 * Get RPCs for a given chain
 * @param chain
 * @returns RPCs from environment variables, followed by shuffled default RPCs
 */
export function getRpcsForChain(chain: ApiChain | ChainId): readonly string[] {
  const apiChain = typeof chain === 'string' ? chain : fromChainId(chain);
  const rpcs = RPCS_BY_CHAIN[apiChain];
  if (!rpcs) {
    throw new Error(`No RPCs found for chain ${apiChain}`);
  }
  return rpcs;
}

// @dev legacy, use getRpcsForChain instead
export const {
  BSC_RPC,
  HECO_RPC,
  AVAX_RPC,
  POLYGON_RPC,
  FANTOM_RPC,
  ONE_RPC,
  ARBITRUM_RPC,
  CELO_RPC,
  MOONRIVER_RPC,
  CRONOS_RPC,
  AURORA_RPC,
  FUSE_RPC,
  METIS_RPC,
  MOONBEAM_RPC,
  EMERALD_RPC,
  OPTIMISM_RPC,
  KAVA_RPC,
  ETH_RPC,
  CANTO_RPC,
  ZKSYNC_RPC,
  ZKEVM_RPC,
  BASE_RPC,
  GNOSIS_RPC,
  LINEA_RPC,
  MANTLE_RPC,
  FRAXTAL_RPC,
  MODE_RPC,
  MANTA_RPC,
  REAL_RPC,
  SEI_RPC,
  ROOTSTOCK_RPC,
  SCROLL_RPC,
  LISK_RPC,
  SONIC_RPC,
  BERACHAIN_RPC,
  UNICHAIN_RPC,
  SAGA_RPC,
  HYPEREVM_RPC,
} = RPC_BY_ENV_KEY;

export {
  API_BASE_URL,
  BSC_CHAIN_ID,
  BSC_VAULTS_ENDPOINT,
  HECO_CHAIN_ID,
  HECO_VAULTS_ENDPOINT,
  AVAX_CHAIN_ID,
  AVAX_VAULTS_ENDPOINT,
  POLYGON_CHAIN_ID,
  POLYGON_VAULTS_ENDPOINT,
  FANTOM_CHAIN_ID,
  FANTOM_VAULTS_ENDPOINT,
  ONE_CHAIN_ID,
  ONE_VAULTS_ENDPOINT,
  ARBITRUM_CHAIN_ID,
  ARBITRUM_VAULTS_ENDPOINT,
  CELO_CHAIN_ID,
  CELO_VAULTS_ENDPOINT,
  MOONRIVER_CHAIN_ID,
  MOONRIVER_VAULTS_ENDPOINT,
  CRONOS_CHAIN_ID,
  CRONOS_VAULTS_ENDPOINT,
  AURORA_CHAIN_ID,
  AURORA_VAULTS_ENDPOINT,
  FUSE_CHAIN_ID,
  FUSE_VAULTS_ENDPOINT,
  METIS_CHAIN_ID,
  METIS_VAULTS_ENDPOINT,
  MOONBEAM_CHAIN_ID,
  MOONBEAM_VAULTS_ENDPOINT,
  EMERALD_CHAIN_ID,
  EMERALD_VAULTS_ENDPOINT,
  OPTIMISM_CHAIN_ID,
  OPTIMISM_VAULTS_ENDPOINT,
  KAVA_CHAIN_ID,
  KAVA_VAULTS_ENDPOINT,
  ETH_CHAIN_ID,
  ETHEREUM_VAULTS_ENDPOINT,
  CANTO_CHAIN_ID,
  CANTO_VAULTS_ENDPOINT,
  ZKSYNC_CHAIN_ID,
  ZKSYNC_VAULTS_ENDPOINT,
  ZKEVM_CHAIN_ID,
  ZKEVM_VAULTS_ENDPOINT,
  BASE_CHAIN_ID,
  BASE_VAULTS_ENDPOINT,
  GNOSIS_CHAIN_ID,
  GNOSIS_VAULTS_ENDPOINT,
  LINEA_CHAIN_ID,
  LINEA_VAULTS_ENDPOINT,
  MANTLE_CHAIN_ID,
  MANTLE_VAULTS_ENDPOINT,
  FRAXTAL_CHAIN_ID,
  FRAXTAL_VAULTS_ENDPOINT,
  MODE_CHAIN_ID,
  MODE_VAULTS_ENDPOINT,
  MANTA_CHAIN_ID,
  MANTA_VAULTS_ENDPOINT,
  REAL_CHAIN_ID,
  REAL_VAULTS_ENDPOINT,
  SEI_CHAIN_ID,
  SEI_VAULTS_ENDPOINT,
  ROOTSTOCK_CHAIN_ID,
  ROOTSTOCK_VAULTS_ENDPOINT,
  HYPEREVM_CHAIN_ID,
  HYPEREVM_VAULTS_ENDPOINT,
  BASE_HPY,
  MINUTELY_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  MULTICHAIN_RPC,
  MULTICHAIN_ENDPOINTS,
  SUSHI_LPF,
  PCS_LPF,
  SPOOKY_LPF,
  JOE_LPF,
  SOLAR_LPF,
  FUSEFI_LPF,
  NET_LPF,
  PANGOLIN_LPF,
  TETHYS_LPF,
  BEAMSWAP_LPF,
  BISWAP_LPF,
  HOP_LPF,
  EXCLUDED_IDS_FROM_TVL,
  SCROLL_CHAIN_ID,
  SCROLL_VAULTS_ENDPOINT,
  LISK_CHAIN_ID,
  LISK_VAULTS_ENDPOINT,
  SONIC_CHAIN_ID,
  SONIC_VAULTS_ENDPOINT,
  BERACHAIN_CHAIN_ID,
  BERACHAIN_VAULTS_ENDPOINT,
  UNICHAIN_CHAIN_ID,
  UNICHAIN_VAULTS_ENDPOINT,
  SAGA_CHAIN_ID,
  SAGA_VAULTS_ENDPOINT,
};
