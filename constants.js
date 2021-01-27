const DEFAULT_BSC_RPC = 'https://bsc-dataseed.binance.org'
const BSC_RPC = process.env.BSC_RPC_3 || process.env.BSC_RPC_2 || process.env.BSC_RPC || DEFAULT_BSC_RPC

const BASE_HPY = process.env.BASE_HPY
const HOURLY_HPY = process.env.HOURLY_HPY
const DAILY_HPY = process.env.DAILY_HPY
const WEEKLY_HPY = process.env.WEEKLY_HPY

const FORTUBE_REQ_TOKENS = process.env.FORTUBE_REQ_TOKENS
const FORTUBE_REQ_MARKETS = process.env.FORTUBE_REQ_MARKETS
const FORTUBE_API_TOKEN = process.env.FORTUBE_API_TOKEN

module.exports = { 
  BSC_RPC, 
  BASE_HPY, HOURLY_HPY, DAILY_HPY, WEEKLY_HPY, 
  FORTUBE_REQ_TOKENS, FORTUBE_REQ_MARKETS, FORTUBE_API_TOKEN
};