import {
  type Abi,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractFunctionReturnType,
  isAddress,
  zeroAddress,
} from 'viem';
import type { ReadCall, Reader, ReadResult } from './reader.ts';
import type { ClmSwapFee } from './types.ts';

export type PoolBase = {
  address: Address;
  factory: Address | undefined;
};

/** The pool matched a kind, but its fee can't be worked out */
export class FeeUnavailableError extends Error {}

export type Probe<value> = (reader: Reader) => Promise<ReadResult<value>>;

type Probes = Record<string, Probe<unknown>>;

export type ProbeResults<probes extends Probes> = { [name in keyof probes]: Awaited<ReturnType<probes[name]>> };

/** A read made while identifying pools, that fails rather than rejects if the call reverts */
export function probe<
  const abi extends Abi,
  functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
  const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
>(
  call: ReadCall<abi, functionName, args>
): Probe<ContractFunctionReturnType<abi, 'pure' | 'view', functionName, args>> {
  return reader => reader.tryRead(call);
}

/**
 * Where an AMM keeps its swap fee and how to read it.
 * Every kind's probes run for every pool in one round; the first kind, in priority order, whose `match` returns a
 * value owns the pool, and that value is passed on to its `fee`.
 */
export type FeeKind<probes extends Probes, match extends object> = {
  name: string;
  /** reads that tell whether the pool is this kind, undefined if it can't be */
  probe(pool: PoolBase): probes | undefined;
  match(pool: PoolBase, results: ProbeResults<probes>): match | undefined;
  /** rejects if a read fails or the pool's fee is unavailable */
  fee(pool: PoolBase & match, reader: Reader): Promise<ClmSwapFee>;
};

export type IdentifiedPool = { kind: string; fee(): Promise<ClmSwapFee> };

export type Kind = {
  name: string;
  identify(pool: PoolBase, reader: Reader): Promise<IdentifiedPool | undefined>;
};

async function runProbes<probes extends Probes>(probes: probes, reader: Reader): Promise<ProbeResults<probes>> {
  const results = await Promise.all(
    Object.entries(probes).map(async ([name, probe]) => [name, await probe(reader)] as const)
  );
  return Object.fromEntries(results) as ProbeResults<probes>;
}

export function defineKind<probes extends Probes, match extends object>(kind: FeeKind<probes, match>): Kind {
  return {
    name: kind.name,
    async identify(pool, reader) {
      const probes = kind.probe(pool);
      if (!probes) return undefined;
      const match = kind.match(pool, await runProbes(probes, reader));
      if (!match) return undefined;
      return { kind: kind.name, fee: () => kind.fee({ ...pool, ...match }, reader) };
    },
  };
}

export function isContract(value: Address): boolean {
  return isAddress(value) && value !== zeroAddress;
}

/** the probed address, if it is set */
export function contractOf(result: ReadResult<Address>): Address | undefined {
  return result.ok && isContract(result.value) ? result.value : undefined;
}
