import { addressBook } from '../../../../packages/address-book/address-book';
const { bsc, heco, polygon, fantom, avax, moonriver, arbitrum } = addressBook;

// BIFI lp pair bifi maxi uses per chain
export const bifiLpMap = {
  bsc: bsc.platforms.pancake.bifiBnbLp,
  heco: heco.platforms.mdex.usdtBifiLp,
  polygon: polygon.platforms.quickswap.wethBifiLp,
  fantom: fantom.platforms.spookyswap.wftmBifiLp,
  avax: avax.platforms.joe.avaxBifiLp,
  moonriver: moonriver.platforms.sushi.bifiMovrLp,
  arbitrum: arbitrum.platforms.sushi.bifiEthLp,
} as const;
