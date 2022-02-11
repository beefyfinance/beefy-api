import { ChainId } from '../packages/address-book/address-book';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const BASE_HPY = 2190;
const MINUTELY_HPY = 525600;
const HOURLY_HPY = 8760;
const DAILY_HPY = 365;
const WEEKLY_HPY = 52;

const FORTUBE_REQ_TOKENS = 'https://bsc.for.tube/api/v2/bank_tokens';
const FORTUBE_REQ_MARKETS = 'https://bsc.for.tube/api/v1/bank/markets?mode=extended';
const FORTUBE_API_TOKEN = process.env.FORTUBE_API_TOKEN;

const MAINNET_BSC_RPC_ENDPOINTS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc-dataseed2.defibit.io',
  'https://bsc-dataseed3.defibit.io',
  'https://bsc-dataseed4.defibit.io',
  'https://bsc-dataseed2.ninicoin.io',
  'https://bsc-dataseed3.ninicoin.io',
  'https://bsc-dataseed4.ninicoin.io',
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
];

const CUSTOM_BSC_RPC_ENDPOINTS = [process.env.BSC_RPC].filter(item => item);

const BSC_RPC_ENDPOINTS = CUSTOM_BSC_RPC_ENDPOINTS.length
  ? CUSTOM_BSC_RPC_ENDPOINTS
  : MAINNET_BSC_RPC_ENDPOINTS;

const BSC_RPC = process.env.BSC_RPC || BSC_RPC_ENDPOINTS[0];
const HECO_RPC = process.env.HECO_RPC || 'https://http-mainnet.hecochain.com';
const AVAX_RPC = process.env.AVAX_RPC || 'https://api.avax.network/ext/bc/C/rpc';
const POLYGON_RPC = process.env.POLYGON_RPC || 'https://polygon-rpc.com/';
const FANTOM_RPC = process.env.FANTOM_RPC || 'https://rpc.ftm.tools';
const ONE_RPC = process.env.ONE_RPC || 'https://api.harmony.one/';
const ARBITRUM_RPC = process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc';
const CELO_RPC = process.env.CELO_RPC || 'https://forno.celo.org';
const MOONRIVER_RPC = process.env.MOONRIVER_RPC || 'https://rpc.moonriver.moonbeam.network';
const CRONOS_RPC = process.env.CRONOS_RPC || 'https://rpc.vvs.finance';
const AURORA_RPC =
  process.env.AURORA_RPC ||
  'https://mainnet.aurora.dev/Fon6fPMs5rCdJc4mxX4kiSK1vsKdzc3D8k6UF8aruek';
const FUSE_RPC = process.env.FUSE_RPC || 'https://rpc.fuse.io';
const METIS_RPC = process.env.METIS_RPC || 'https://andromeda.metis.io/?owner=1088';
const MOONBEAM_RPC = process.env.MOONBEAM_RPC || 'https://rpc.api.moonbeam.network';

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

const DFYN_LPF = 0.003;
const SUSHI_LPF = 0.003;
const SPIRIT_LPF = 0.003;
const QUICK_LPF = 0.003;
const APEPOLY_LPF = 0.002;
const COMETH_LPF = 0.005;
const PCS_LPF = 0.0025;
const APE_LPF = 0.002;
const SPOOKY_LPF = 0.002;
const JOE_LPF = 0.003;
const SOLAR_LPF = 0.0025;
const FUSEFI_LPF = 0.003;
const NET_LPF = 0.003;
const PANGOLIN_LPF = 0.003;
const TETHYS_LPF = 0.002;
const BEAMSWAP_LPF = 0.0017;

const MULTICHAIN_RPC: Record<ChainId, string> = {
  [ChainId.bsc]: BSC_RPC,
  [ChainId.heco]: HECO_RPC,
  [ChainId.polygon]: POLYGON_RPC,
  [ChainId.avax]: AVAX_RPC,
  [ChainId.fantom]: FANTOM_RPC,
  [ChainId.one]: ONE_RPC,
  [ChainId.arbitrum]: ARBITRUM_RPC,
  [ChainId.celo]: CELO_RPC,
  [ChainId.moonriver]: MOONRIVER_RPC,
  [ChainId.cronos]: CRONOS_RPC,
  [ChainId.aurora]: AURORA_RPC,
  [ChainId.fuse]: FUSE_RPC,
  [ChainId.metis]: METIS_RPC,
  [ChainId.moonbeam]: MOONBEAM_RPC,
};

const BSC_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/bsc_pools.js';
const HECO_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/heco_pools.js';
const AVAX_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/avalanche_pools.js';
const POLYGON_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/polygon_pools.js';
const FANTOM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/fantom_pools.js';
const ONE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/harmony_pools.js';
const ARBITRUM_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/arbitrum_pools.js';
const CELO_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/celo_pools.js';
const MOONRIVER_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/moonriver_pools.js';
const CRONOS_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/cronos_pools.js';
const AURORA_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/aurora_pools.js';
const FUSE_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/fuse_pools.js';
const METIS_VAULTS_ENDPOINT =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/metis_pools.js';
//const MOONBEAM_VAULTS_ENDPOINT =
//  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/moonbeam_pools.js';

const MULTICHAIN_ENDPOINTS = {
  bsc: BSC_VAULTS_ENDPOINT,
  heco: HECO_VAULTS_ENDPOINT,
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
  // moonbeam: MOONBEAM_VAULTS_ENDPOINT,
};

const BEEFY_PERFORMANCE_FEE = 0.045;
const SHARE_AFTER_PERFORMANCE_FEE = 1 - BEEFY_PERFORMANCE_FEE;

const EXCLUDED_IDS_FROM_TVL = ['venus-wbnb'];

export {
  API_BASE_URL,
  BSC_RPC,
  BSC_RPC_ENDPOINTS,
  BSC_CHAIN_ID,
  BSC_VAULTS_ENDPOINT,
  HECO_RPC,
  HECO_CHAIN_ID,
  HECO_VAULTS_ENDPOINT,
  AVAX_RPC,
  AVAX_CHAIN_ID,
  AVAX_VAULTS_ENDPOINT,
  POLYGON_RPC,
  POLYGON_CHAIN_ID,
  POLYGON_VAULTS_ENDPOINT,
  FANTOM_RPC,
  FANTOM_CHAIN_ID,
  FANTOM_VAULTS_ENDPOINT,
  ONE_RPC,
  ONE_CHAIN_ID,
  ONE_VAULTS_ENDPOINT,
  ARBITRUM_RPC,
  ARBITRUM_CHAIN_ID,
  ARBITRUM_VAULTS_ENDPOINT,
  CELO_RPC,
  CELO_CHAIN_ID,
  CELO_VAULTS_ENDPOINT,
  MOONRIVER_RPC,
  MOONRIVER_CHAIN_ID,
  MOONRIVER_VAULTS_ENDPOINT,
  CRONOS_RPC,
  CRONOS_CHAIN_ID,
  CRONOS_VAULTS_ENDPOINT,
  AURORA_RPC,
  AURORA_CHAIN_ID,
  AURORA_VAULTS_ENDPOINT,
  FUSE_RPC,
  FUSE_CHAIN_ID,
  FUSE_VAULTS_ENDPOINT,
  METIS_RPC,
  METIS_CHAIN_ID,
  METIS_VAULTS_ENDPOINT,
  MOONBEAM_RPC,
  MOONBEAM_CHAIN_ID,
  // MOONBEAM_VAULTS_ENDPOINT,
  BASE_HPY,
  MINUTELY_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  FORTUBE_REQ_TOKENS,
  FORTUBE_REQ_MARKETS,
  FORTUBE_API_TOKEN,
  MULTICHAIN_RPC,
  MULTICHAIN_ENDPOINTS,
  DFYN_LPF,
  SUSHI_LPF,
  SPIRIT_LPF,
  QUICK_LPF,
  APEPOLY_LPF,
  COMETH_LPF,
  PCS_LPF,
  APE_LPF,
  SPOOKY_LPF,
  JOE_LPF,
  SOLAR_LPF,
  FUSEFI_LPF,
  NET_LPF,
  PANGOLIN_LPF,
  TETHYS_LPF,
  BEAMSWAP_LPF,
  BEEFY_PERFORMANCE_FEE,
  SHARE_AFTER_PERFORMANCE_FEE,
  EXCLUDED_IDS_FROM_TVL,
};
