const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const BSC_CHAIN_ID = 56;
const HECO_CHAIN_ID = 128;

const MAINNET_BSC_RPC_ENDPOINTS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
];

const CUSTOM_BSC_RPC_ENDPOINTS = [
  process.env.BSC_RPC_3,
  process.env.BSC_RPC_2,
  process.env.BSC_RPC,
].filter(item => item);

const BSC_RPC_ENDPOINTS = CUSTOM_BSC_RPC_ENDPOINTS.length
  ? CUSTOM_BSC_RPC_ENDPOINTS
  : MAINNET_BSC_RPC_ENDPOINTS;
const BSC_RPC = BSC_RPC_ENDPOINTS[0];

const HECO_RPC = process.env.HECO_RPC || 'https://http-mainnet.hecochain.com';

const BASE_HPY = 2190;
const HOURLY_HPY = 8760;
const DAILY_HPY = 365;
const WEEKLY_HPY = 52;

const FORTUBE_REQ_TOKENS = 'https://bsc.for.tube/api/v2/bank_tokens';
const FORTUBE_REQ_MARKETS = 'https://bsc.for.tube/api/v1/bank/markets?mode=extended';
const FORTUBE_API_TOKEN = process.env.FORTUBE_API_TOKEN;

module.exports = {
  API_BASE_URL,
  BSC_RPC,
  BSC_RPC_ENDPOINTS,
  BSC_CHAIN_ID,
  HECO_RPC,
  HECO_CHAIN_ID,
  BASE_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  FORTUBE_REQ_TOKENS,
  FORTUBE_REQ_MARKETS,
  FORTUBE_API_TOKEN,
};
