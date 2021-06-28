import { addressBook } from 'blockchain-addressbook';
const { bsc, heco, polygon } = addressBook;

// BIFI lp pair bifi maxi uses per chain
export const bifiLpMap = {
  bsc: bsc.platforms.pancake.bifiBnbLp,
  heco: heco.platforms.mdex.usdtBifiLp,
  polygon: polygon.platforms.quickswap.wethBifiLp,
} as const;
