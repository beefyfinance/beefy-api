import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CowVault } from '../../vaults/types.ts';
import { MAX_AGE, mergeFees } from './index.ts';
import type { ClmSwapFee, ClmSwapFees } from './types.ts';

const mocks = vi.hoisted(() => ({
  fetchChainSwapFees: vi.fn<(chain: string, vaults: CowVault[]) => Promise<ClmSwapFees>>(),
  getVaultsByType: vi.fn<() => CowVault[]>(),
  getKey: vi.fn<(key: string) => Promise<unknown>>(),
  setKey: vi.fn<(key: string, value: unknown) => Promise<void>>(),
}));
vi.mock('./fetch.ts', () => ({ fetchChainSwapFees: mocks.fetchChainSwapFees }));
vi.mock('../../stats/getMultichainVaults.ts', () => ({ getVaultsByType: mocks.getVaultsByType }));
vi.mock('../../../utils/cache/index.ts', () => ({ getKey: mocks.getKey, setKey: mocks.setKey }));
vi.mock('../../../utils/ServiceEventBus.ts', () => ({
  serviceEventBus: { waitForFirstEvent: () => Promise.resolve(true) },
}));
vi.mock('../../../utils/logger/index.ts', () => ({
  getLoggerFor: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

const MINUTE = 60 * 1000;
const fee = (current: number): ClmSwapFee => ({ current, dynamic: false });
const vault = (id: string, chain: string) => ({ id, chain }) as CowVault;

async function loadService() {
  vi.resetModules();
  return import('./index.ts');
}

describe('mergeFees', () => {
  const now = 1_000_000_000;

  it('stores a read fee with when it was read', () => {
    expect(mergeFees({ a: { fee: fee(1), updatedAt: 0 } }, { a: fee(2) }, ['a'], now)).toStrictEqual({
      a: { fee: fee(2), updatedAt: now },
    });
  });

  it('keeps the last fee of a vault whose read failed', () => {
    const previous = { a: { fee: fee(1), updatedAt: now - MAX_AGE } };
    expect(mergeFees(previous, {}, ['a'], now)).toStrictEqual(previous);
  });

  it('drops a fee older than the max age', () => {
    expect(mergeFees({ a: { fee: fee(1), updatedAt: now - MAX_AGE - 1 } }, {}, ['a'], now)).toStrictEqual({});
  });

  it('drops vaults that are no longer listed', () => {
    expect(mergeFees({ a: { fee: fee(1), updatedAt: now } }, { b: fee(2) }, ['b'], now)).toStrictEqual({
      b: { fee: fee(2), updatedAt: now },
    });
  });
});

describe('cow swap fees service', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: 1_800_000_000_000 });
    mocks.getKey.mockResolvedValue(undefined);
    mocks.setKey.mockResolvedValue();
    mocks.getVaultsByType.mockReturnValue([vault('a', 'base'), vault('b', 'arbitrum')]);
    mocks.fetchChainSwapFees.mockImplementation(
      async (chain): Promise<ClmSwapFees> => (chain === 'base' ? { a: fee(1) } : { b: fee(2) })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('serves nothing until the first update', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    expect(service.getCowSwapFees()).toBeUndefined();

    await vi.advanceTimersByTimeAsync(service.INIT_DELAY);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(1), b: fee(2) });
    expect(mocks.fetchChainSwapFees).toHaveBeenCalledWith('base', [vault('a', 'base')]);
  });

  it('caches each fee with when it was read', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY);
    expect(mocks.setKey).toHaveBeenLastCalledWith('COW_SWAP_FEES', {
      a: { fee: fee(1), updatedAt: Date.now() },
      b: { fee: fee(2), updatedAt: Date.now() },
    });
  });

  it('restores cached fees that are not too old', async () => {
    const service = await loadService();
    mocks.getKey.mockResolvedValue({
      a: { fee: fee(3), updatedAt: Date.now() - service.MAX_AGE },
      b: { fee: fee(4), updatedAt: Date.now() - service.MAX_AGE - 1 },
    });
    await service.initCowSwapFeesService();
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(3) });
  });

  it('updates the other chains when one fails', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY);

    mocks.fetchChainSwapFees.mockImplementation(async chain => {
      if (chain === 'base') return { a: fee(5) };
      throw new Error('rpc down');
    });
    await vi.advanceTimersByTimeAsync(service.REFRESH_INTERVAL);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(5), b: fee(2) });
  });

  it('does not wait for a chain that hangs', async () => {
    const service = await loadService();
    mocks.fetchChainSwapFees.mockImplementation(chain =>
      chain === 'base' ? Promise.resolve({ a: fee(1) }) : new Promise(() => {})
    );
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY + service.CHAIN_TIMEOUT);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(1) });
  });

  it('drops the fee of a vault that keeps failing once it is too old', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY);

    mocks.fetchChainSwapFees.mockImplementation(
      async (chain): Promise<ClmSwapFees> => (chain === 'base' ? { a: fee(1) } : {})
    );
    await vi.advanceTimersByTimeAsync(service.MAX_AGE);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(1), b: fee(2) });

    await vi.advanceTimersByTimeAsync(service.REFRESH_INTERVAL);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(1) });
  });

  it('drops vaults that are no longer listed, including whole chains', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY);

    mocks.getVaultsByType.mockReturnValue([vault('a', 'base')]);
    await vi.advanceTimersByTimeAsync(service.REFRESH_INTERVAL);
    expect(service.getCowSwapFees()).toStrictEqual({ a: fee(1) });
    expect(mocks.fetchChainSwapFees).not.toHaveBeenLastCalledWith('arbitrum', expect.anything());
  });

  it('refreshes every interval', async () => {
    const service = await loadService();
    await service.initCowSwapFeesService();
    await vi.advanceTimersByTimeAsync(service.INIT_DELAY + 2 * service.REFRESH_INTERVAL + MINUTE);
    expect(mocks.fetchChainSwapFees).toHaveBeenCalledTimes(6);
  });
});
