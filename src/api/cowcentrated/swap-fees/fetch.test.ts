import { toHex } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import type { CowVault } from '../../vaults/types.ts';
import { fetchChainSwapFees } from './fetch.ts';
import { FakeChain } from './test/fake-chain.ts';
import { scenarios } from './test/scenarios.ts';

const rpc = vi.hoisted(() => ({ client: undefined as unknown }));
vi.mock('../../rpc/client.ts', () => ({ getRPCClient: () => rpc.client }));
vi.mock('../../../utils/logger/index.ts', () => ({
  getLoggerFor: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

function run(scenario: (typeof scenarios)[number]) {
  const chain = new FakeChain();
  const vaults: CowVault[] = scenario.setup(chain);
  rpc.client = chain.client();
  return { chain, result: fetchChainSwapFees('base', vaults) };
}

const scenario = (name: string) => {
  const found = scenarios.find(s => s.name === name);
  if (!found) throw new Error(`no scenario ${name}`);
  return found;
};

describe('fetchChainSwapFees', () => {
  it.each(scenarios)('$name', async scenario => {
    await expect(run(scenario).result).resolves.toStrictEqual(scenario.expected);
  });

  it('reads everything at one block, a few behind latest', async () => {
    const { chain, result } = run(scenario('algebra v1: fee from the data storage operator, asked as the pool'));
    await result;
    expect(chain.reads.length).toBeGreaterThan(0);
    expect(new Set(chain.reads.map(read => read.block))).toStrictEqual(new Set([toHex(chain.latestBlock - 5n)]));
  });

  it('reads each value once for vaults on the same pool', async () => {
    const { chain, result } = run(scenario('vaults on the same pool'));
    await result;
    for (const functionName of ['factory', 'getPoolSwapHook', 'dynamicFeeConfig', 'slot0', 'observe']) {
      expect(chain.readsOf(functionName), functionName).toHaveLength(1);
    }
  });

  it('identifies every vault in one round of multicalls', async () => {
    const { chain, result } = run(scenario('vaults on different pools'));
    await result;
    const probes = ['getPoolSwapHook', 'swapFeeModule', 'plugin', 'dataStorageOperator', 'currentFee', 'accessHub'];
    const requests = new Set(
      chain.reads.filter(read => probes.includes(read.functionName ?? '')).map(read => read.request)
    );
    expect(requests.size).toBe(1);
  });
});
