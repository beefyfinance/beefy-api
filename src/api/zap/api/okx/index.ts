import type { Address } from 'viem';
import { type ApiChain, getChainConfig, SupportedChains, toChainId } from '../../../../utils/chain.ts';
import { getZapRouter } from '../common.ts';
import { OkxQueue } from './queue.ts';
import { RateLimitedOkxApi } from './RateLimitedOkxApi.ts';

export { isOkxCircuitOpenedSince } from './OkxApi.ts';

import type { IOkxApi } from './types.ts';

// One queue for crawler and proxy, as the (trial) api key is limited to 1 RPS across all endpoints
const API_QUEUE_CONFIG = {
  concurrency: 1,
  intervalCap: 1,
  interval: 1100,
  // Sliding window, so starts are always >= interval apart (fixed windows allow back to back starts at a boundary)
  strict: true,
  autoStart: true,
  timeout: 30 * 1000,
};

// https://web3.okx.com/onchainos/dev-docs/trade/dex-smart-contract
/** Allowed tx.to per chain; swaps fail closed if OKX returns any other address */
const OKX_ROUTERS: Partial<Record<ApiChain, readonly Address[]>> = {
  ethereum: ['0x8feAB81D36E7576107D5dE0758c1b839Be31B4F6'],
  polygon: ['0x3C4829196BFadFF4394726b45159aeaAC6FCd41c'],
  bsc: ['0x5994814f2C4040b863A0125A45DE152a8c2A4DEc'],
  avax: ['0xAB96dcFA7A7D669d9BF5918faB8641479973dD0A'],
  arbitrum: ['0x09f94b5Fc68e227C323A6FbaE3Bd98C97fD8c849'],
  optimism: ['0x1f5B43127414E36c31eCb5Ff5567262997CD24D0'],
  base: ['0x67d03631FE51B741C0C00c4E16eb662AC84381df'],
  hyperevm: ['0xb193874f0C77948d2bCFeC2EfAF8Bc65B4C2ca89'],
  plasma: ['0xd72f9Af181A0eB1B8550a00124ECdb71Bb758C89'],
  monad: ['0xc1C76E784Db8D68585fb608ce68FC5DcFF14000E'],
  robinhood: ['0x6e2A35A7AD683cF634D91492d73bb7FF774c6919'],
  arc: ['0x4E3bcCE28cAf98A143Fd8BD9e4875ccAb3E7bBE0'],
};

/** OKX TokenApprove contract per chain; ERC20 input must be approved to this, not the router (tx.to) */
const OKX_APPROVE_ADDRESSES: Partial<Record<ApiChain, Address>> = {
  ethereum: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
  polygon: '0x3B86917369B83a6892f553609F3c2F439C184e31',
  bsc: '0x2c34A2Fb1d0b4f55de51E1d0bDEfaDDce6b7cDD6',
  avax: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
  arbitrum: '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
  optimism: '0x68D6B739D2020067D1e2F713b999dA97E4d54812',
  base: '0x57df6092665eb6058DE53939612413ff4B09114E',
  hyperevm: '0x56e6983D59bF472Ced0E63966A14d94A3A291589',
  plasma: '0x9FD43F5E4c24543b2eBC807321E58e6D350d6a5A',
  monad: '0xf534A8a1CAD0543Cd6438f7534CA3486c01998d4',
  robinhood: '0x42170295F1173c9e5874ea9d00c6d137E1a4f53d',
  arc: '0x2B9899bC46Bf0eE094225995f4bD496d42f261Af',
};

export const supportedSwapChains = new Set<ApiChain>(
  SupportedChains.filter(chain => getChainConfig(chain).integrations.okx)
);

const swapApiByChain: Partial<Record<ApiChain, IOkxApi>> = {};

let apiQueue: OkxQueue | undefined;

export function getOkxApi(apiChain: ApiChain): IOkxApi {
  if (!supportedSwapChains.has(apiChain)) {
    throw new Error(`OKX api is not supported on ${apiChain}`);
  }

  const existing = swapApiByChain[apiChain];
  if (existing) {
    return existing;
  }

  const routers = OKX_ROUTERS[apiChain];
  if (!routers || routers.length === 0) {
    throw new Error(`OKX router address is not configured for ${apiChain}`);
  }

  const approveAddress = OKX_APPROVE_ADDRESSES[apiChain];
  if (!approveAddress) {
    throw new Error(`OKX approve address is not configured for ${apiChain}`);
  }

  const zapRouter = getZapRouter(apiChain);
  if (!zapRouter) {
    throw new Error(`Zap router address is not configured for ${apiChain}`);
  }

  apiQueue ??= new OkxQueue(API_QUEUE_CONFIG);

  const { OKX_API_KEY: apiKey, OKX_API_SECRET: apiSecret, OKX_API_PASSPHRASE: apiPassphrase } = process.env;
  if (!apiKey || !apiSecret || !apiPassphrase) {
    throw new Error(`OKX_API_KEY, OKX_API_SECRET and OKX_API_PASSPHRASE env variables must be set`);
  }

  const api = new RateLimitedOkxApi(
    'https://web3.okx.com',
    toChainId(apiChain),
    routers,
    approveAddress,
    zapRouter,
    apiKey,
    apiSecret,
    apiPassphrase,
    apiQueue
  );
  swapApiByChain[apiChain] = api;
  return api;
}
