import { uniq } from 'lodash-es';
import { keysToObject } from '../../utils/array.ts';
import { type ApiChain, ApiChainId, fromChainId, getChainConfig, SupportedChains } from '../../utils/chain.ts';

function getRpcsFromEnv(chain: ApiChain): string[] {
  const envKey = getChainConfig(chain).rpcEnvKey;
  const envValue = process.env[envKey];
  if (envValue) {
    return envValue
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }
  return [];
}

const rpcsByChain = keysToObject(SupportedChains, chain =>
  uniq([...getRpcsFromEnv(chain), ...getChainConfig(chain).rpcs])
);

/** RPCs from the chain's env var, followed by the configured defaults */
export function getRpcsForChain(chain: ApiChain): readonly string[] {
  return rpcsByChain[chain];
}

/** Primary rpc by chain id */
export const MULTICHAIN_RPC = keysToObject(
  Object.values(ApiChainId),
  chainId => getRpcsForChain(fromChainId(chainId))[0]
);
