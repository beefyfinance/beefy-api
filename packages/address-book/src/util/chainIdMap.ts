import type { ChainIdMap } from '../types/chainid.js';

export const chainIdMap = {
  bsc: 56,
  heco: 128,
  avax: 43114,
  fantom: 250,
  polygon: 137,
  one: 1666600000,
  arbitrum: 42161,
  celo: 42220,
  moonriver: 1285,
  cronos: 25,
  aurora: 1313161554,
  fuse: 122,
  metis: 1088,
  moonbeam: 1284,
  emerald: 42262,
  optimism: 10,
  kava: 2222,
  ethereum: 1,
  canto: 7700,
  zksync: 324,
  zkevm: 1101,
  base: 8453,
  gnosis: 100,
  linea: 59144,
  mantle: 5000,
  fraxtal: 252,
  mode: 34443,
  manta: 169,
  real: 111188,
  sei: 1329,
  rootstock: 30,
} satisfies ChainIdMap;

// back-compat
export default chainIdMap;
