import { getJson } from '../../../../utils/http/index.ts';
import type { FetchParams } from '../../../../utils/http/types.ts';
import type { MerklProxyOpportunity } from './proxyTypes.ts';

const BASE_URL = process.env.BEEFY_MERKL_API_URL || 'https://merkl-api.beefy.finance';
const API_KEY = process.env.BEEFY_MERKL_API_KEY;

function merklProxyGet<T>(path: string, params?: FetchParams): Promise<T> {
  return getJson<T>({
    url: `${BASE_URL}${path}`,
    params,
    headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : undefined,
  });
}

/** Opportunity APR as a decimal fraction: prefer apr (percent/100), else annualized dailyRewards/tvl. */
export function merklAprFromOpportunity(o: MerklProxyOpportunity | undefined): number {
  if (!o) return 0;
  if (typeof o.apr === 'number' && Number.isFinite(o.apr)) {
    return o.apr / 100;
  }
  if (
    typeof o.dailyRewards === 'number'
    && Number.isFinite(o.dailyRewards)
    && typeof o.tvl === 'number'
    && Number.isFinite(o.tvl)
    && o.tvl > 0
  ) {
    return (o.dailyRewards * 365) / o.tvl;
  }
  return 0;
}

/**
 * Decimal APR keyed by lower-cased explorerAddress. When several opportunities share an address (e.g. a
 * base vault and a whitelist variant), prefer the one whose identifier equals the address, else the
 * highest-APR one — the proxy returns all matches and we resolve here.
 */
export async function getMerklAprByExplorerAddress(
  chainId: number | string,
  explorerAddresses: string[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  if (explorerAddresses.length === 0) return result;
  const opps = await merklProxyGet<MerklProxyOpportunity[]>(`/v1/opportunities/${chainId}`, {
    explorerAddress: explorerAddresses.join(','),
  });
  const byAddress = new Map<string, MerklProxyOpportunity[]>();
  for (const o of opps) {
    const addr = o.explorerAddress?.toLowerCase();
    if (!addr) continue;
    const list = byAddress.get(addr);
    if (list) list.push(o);
    else byAddress.set(addr, [o]);
  }
  for (const address of explorerAddresses) {
    const lower = address.toLowerCase();
    const candidates = byAddress.get(lower) ?? [];
    const exact = candidates.find(o => o.identifier.toLowerCase() === lower);
    const highest = candidates.reduce<MerklProxyOpportunity | undefined>(
      (acc, o) => (!acc || o.apr > acc.apr ? o : acc),
      undefined
    );
    result[lower] = merklAprFromOpportunity(exact ?? highest);
  }
  return result;
}

/** Decimal APR keyed by lower-cased opportunity identifier. */
export async function getMerklAprByIdentifier(
  chainId: number | string,
  identifiers: string[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};
  if (identifiers.length === 0) return result;
  const opps = await merklProxyGet<MerklProxyOpportunity[]>(`/v1/opportunities/${chainId}`, {
    identifier: identifiers.join(','),
  });
  const byIdentifier = new Map<string, MerklProxyOpportunity>();
  for (const o of opps) {
    const id = o.identifier.toLowerCase();
    const existing = byIdentifier.get(id);
    if (!existing || o.apr > existing.apr) byIdentifier.set(id, o);
  }
  for (const identifier of identifiers) {
    result[identifier.toLowerCase()] = merklAprFromOpportunity(byIdentifier.get(identifier.toLowerCase()));
  }
  return result;
}

/** Opportunities for a mainProtocolId (e.g. 'aave') on a single chain (no campaigns). */
export function getMerklOpportunitiesByProtocol(
  chainId: number | string,
  mainProtocolId: string
): Promise<MerklProxyOpportunity[]> {
  return merklProxyGet(`/v1/opportunities/${chainId}`, { mainProtocolId });
}

/** Opportunities + their campaigns for a chain, optionally filtered to the given opportunity types. */
export function getMerklOpportunitiesForChain(
  chainId: number | string,
  types?: string[]
): Promise<MerklProxyOpportunity[]> {
  return merklProxyGet(`/v1/opportunities/${chainId}`, {
    campaigns: 'true',
    ...(types && types.length ? { types: types.join(',') } : {}),
  });
}
