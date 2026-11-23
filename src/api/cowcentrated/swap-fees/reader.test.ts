import { parseAbi, toHex } from 'viem';
import { describe, expect, it } from 'vitest';
import { Reader } from './reader.ts';
import { clPoolAbi, legacyFeeModuleAbi, volatilityFeeSourceAbi } from './test/abis.ts';
import { FakeChain, type Handlers, revert, rpcFailure } from './test/fake-chain.ts';
import { MODULE, POOL } from './test/world.ts';

const EOA = '0x000000000000000000000000000000000000bEEF';
const BLOCK = 995n;

function setup(pool: Handlers<typeof clPoolAbi> = {}) {
  const chain = new FakeChain();
  chain.deploy(POOL, clPoolAbi, {
    fee: () => 500,
    tickSpacing: () => 100,
    slot0: () => [1n, -7, 1, 2, 3, true],
    ...pool,
  });
  return { chain, reader: new Reader(chain.client(), { number: BLOCK, timestamp: chain.timestamp }) };
}

const fee = { address: POOL, abi: clPoolAbi, functionName: 'fee' } as const;

describe('Reader.read', () => {
  it('returns the decoded result', async () => {
    const { reader } = setup();
    await expect(reader.read({ address: POOL, abi: clPoolAbi, functionName: 'slot0' })).resolves.toStrictEqual([
      1n,
      -7,
      1,
      2,
      3,
      true,
    ]);
  });

  it('reads at the pinned block', async () => {
    const { chain, reader } = setup();
    await reader.read(fee);
    expect(chain.reads.map(read => read.block)).toStrictEqual([toHex(BLOCK)]);
  });

  it('batches concurrent reads into one multicall', async () => {
    const { chain, reader } = setup();
    await Promise.all([reader.read(fee), reader.read({ address: POOL, abi: clPoolAbi, functionName: 'tickSpacing' })]);
    expect(chain.requests).toStrictEqual([{ method: 'aggregate3', batchSize: 2 }]);
  });

  it('reads the same call once', async () => {
    const { chain, reader } = setup();
    await Promise.all([reader.read(fee), reader.read(fee)]);
    await reader.read({ ...fee });
    expect(chain.readsOf('fee')).toHaveLength(1);
  });

  it('reads the same call from a different account separately, without batching', async () => {
    const { chain, reader } = setup();
    await Promise.all([reader.read(fee), reader.read({ ...fee, account: POOL })]);
    const reads = chain.readsOf('fee');
    expect(reads).toHaveLength(2);
    expect(reads.filter(read => !read.batched).map(read => read.from)).toStrictEqual([POOL]);
  });

  it('decodes the same call with each abi it is read with', async () => {
    const { chain, reader } = setup();
    chain.deploy(MODULE, legacyFeeModuleAbi, { dynamicFeeConfig: () => [1, 2, 3n] });
    const call = { address: MODULE, functionName: 'dynamicFeeConfig', args: [POOL] } as const;
    await expect(reader.tryRead({ ...call, abi: volatilityFeeSourceAbi })).resolves.toStrictEqual({ ok: false });
    await expect(reader.tryRead({ ...call, abi: legacyFeeModuleAbi })).resolves.toStrictEqual({
      ok: true,
      value: [1, 2, 3n],
    });
  });

  it('rejects on a revert', async () => {
    const { reader } = setup({ fee: () => revert() });
    await expect(reader.read(fee)).rejects.toThrow(/reverted/);
  });
});

describe('Reader.tryRead', () => {
  it('returns the result of a successful call', async () => {
    const { reader } = setup();
    await expect(reader.tryRead(fee)).resolves.toStrictEqual({ ok: true, value: 500 });
  });

  it('fails a batched call that reverts', async () => {
    const { reader } = setup({ fee: () => revert() });
    await expect(reader.tryRead(fee)).resolves.toStrictEqual({ ok: false });
  });

  it('fails a direct call that reverts', async () => {
    const { reader } = setup({ fee: (_, from) => (from === POOL ? revert() : 500) });
    await expect(reader.tryRead({ ...fee, account: POOL })).resolves.toStrictEqual({ ok: false });
  });

  it('fails a function the contract does not have', async () => {
    const { reader } = setup({ fee: undefined });
    await expect(reader.tryRead(fee)).resolves.toStrictEqual({ ok: false });
  });

  it('fails a call to an address without code', async () => {
    const { reader } = setup();
    await expect(reader.tryRead({ ...fee, address: EOA })).resolves.toStrictEqual({ ok: false });
  });

  it('fails a result with fewer fields than the abi', async () => {
    const { chain, reader } = setup();
    chain.deploy(MODULE, legacyFeeModuleAbi, { dynamicFeeConfig: () => [1, 2, 3n] });
    const call = {
      address: MODULE,
      abi: volatilityFeeSourceAbi,
      functionName: 'dynamicFeeConfig',
      args: [POOL],
    } as const;
    await expect(reader.tryRead(call)).resolves.toStrictEqual({ ok: false });
  });

  it('fails a result that does not decode', async () => {
    const { reader } = setup({ slot0: () => [1n, -7, 2, 2, 3, true] });
    const badBool = parseAbi(['function slot0() view returns (uint160, int24, bool)']);
    await expect(reader.tryRead({ address: POOL, abi: badBool, functionName: 'slot0' })).resolves.toStrictEqual({
      ok: false,
    });
  });

  it('rejects when the rpc request of a batched call fails', async () => {
    const { reader } = setup({ fee: () => rpcFailure() });
    await expect(reader.tryRead(fee)).rejects.toThrow(/header not found/);
  });

  it('rejects when the rpc request of a direct call fails', async () => {
    const { reader } = setup({ fee: () => rpcFailure() });
    await expect(reader.tryRead({ ...fee, account: POOL })).rejects.toThrow(/header not found/);
  });

  it('rejects when the rpc is rate limited', async () => {
    const { reader } = setup({ fee: () => rpcFailure('rate limited', 429) });
    await expect(reader.tryRead(fee)).rejects.toThrow(/rate limited/);
  });

  it('rejects on a transport error', async () => {
    const { reader } = setup({
      fee: () => {
        throw new Error('socket hang up');
      },
    });
    await expect(reader.tryRead(fee)).rejects.toThrow(/socket hang up/);
  });
});
