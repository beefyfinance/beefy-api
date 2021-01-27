const DEFAULT_BSC_RPC = 'https://bsc-dataseed.binance.org'
const BSC_RPC = process.env.BSC_RPC_2 || process.env.BSC_RPC || DEFAULT_BSC_RPC

module.exports = { BSC_RPC };