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

const BSC_RPC = BSC_RPC_ENDPOINTS[0];
const HECO_RPC = process.env.HECO_RPC || 'https://http-mainnet.hecochain.com';
const AVAX_RPC = process.env.AVAX_RPC || 'https://api.avax.network/ext/bc/C/rpc';
const POLYGON_RPC =
  process.env.POLYGON_RPC ||
  'https://rpc-mainnet.maticvigil.com/v1/ba179aaf2df98fd170b257f062ff3074e4ef7009';
const FANTOM_RPC = process.env.FANTOM_RPC || 'https://rpc.ftm.tools';

const BSC_CHAIN_ID = 56;
const HECO_CHAIN_ID = 128;
const POLYGON_CHAIN_ID = 137;
const AVAX_CHAIN_ID = 43114;
const FANTOM_CHAIN_ID = 250;

const MULTICHAIN_RPC = {
  56: BSC_RPC,
  128: HECO_RPC,
  137: POLYGON_RPC,
  43114: AVAX_RPC,
  250: FANTOM_RPC,
};

module.exports = {
  API_BASE_URL,
  BSC_RPC,
  BSC_RPC_ENDPOINTS,
  BSC_CHAIN_ID,
  HECO_RPC,
  HECO_CHAIN_ID,
  AVAX_RPC,
  AVAX_CHAIN_ID,
  POLYGON_RPC,
  POLYGON_CHAIN_ID,
  FANTOM_RPC,
  FANTOM_CHAIN_ID,
  BASE_HPY,
  MINUTELY_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  FORTUBE_REQ_TOKENS,
  FORTUBE_REQ_MARKETS,
  FORTUBE_API_TOKEN,
  MULTICHAIN_RPC,
};
