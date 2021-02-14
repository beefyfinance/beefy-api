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

const HECO_RPC = process.env.HECO_RPC;

const REWARDER_PRIVATE_KEY = process.env.REWARDER_PRIVATE_KEY;

const BASE_HPY = process.env.BASE_HPY;
const HOURLY_HPY = process.env.HOURLY_HPY;
const DAILY_HPY = process.env.DAILY_HPY;
const WEEKLY_HPY = process.env.WEEKLY_HPY;

const FORTUBE_REQ_TOKENS = process.env.FORTUBE_REQ_TOKENS;
const FORTUBE_REQ_MARKETS = process.env.FORTUBE_REQ_MARKETS;
const FORTUBE_API_TOKEN = process.env.FORTUBE_API_TOKEN;

module.exports = {
  BSC_RPC,
  BSC_RPC_ENDPOINTS,
  HECO_RPC,
  REWARDER_PRIVATE_KEY,
  BASE_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  FORTUBE_REQ_TOKENS,
  FORTUBE_REQ_MARKETS,
  FORTUBE_API_TOKEN,
};
