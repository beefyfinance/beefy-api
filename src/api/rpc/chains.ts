import { addressBook, type ChainId } from '@beefyfinance/blockchain-addressbook';
import type { Chain } from 'viem';
import { keysToObject } from '../../utils/array.ts';
import { type ApiChain, ApiChainId, fromChainId, getChainConfig, toChainId } from '../../utils/chain.ts';
import { getRpcsForChain } from './rpcs.ts';

function buildChain(chain: ApiChain): Chain {
  const config = getChainConfig(chain);
  const { name, symbol, decimals } = addressBook[chain].native;
  return {
    id: toChainId(chain),
    name: config.name,
    nativeCurrency: { name, symbol, decimals },
    rpcUrls: { default: { http: getRpcsForChain(chain) } },
    blockExplorers: { default: config.explorer },
    contracts: { multicall3: config.contracts.multicall3 },
  };
}

const chainsById: Partial<Record<ChainId, Chain>> = keysToObject(Object.values(ApiChainId), chainId =>
  buildChain(fromChainId(chainId))
);

export function getChain(chainId: ChainId): Chain {
  const chain = chainsById[chainId];
  if (!chain) throw new Error(`Unknown chainId ${chainId}`);
  return chain;
}
