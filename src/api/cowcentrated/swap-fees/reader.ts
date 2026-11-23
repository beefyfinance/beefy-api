import {
  type Abi,
  type Address,
  BaseError,
  CallExecutionError,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractFunctionParameters,
  type ContractFunctionReturnType,
  decodeFunctionResult,
  ExecutionRevertedError,
  encodeFunctionData,
  getContractError,
  type Hex,
  type PublicClient,
  RawContractError,
} from 'viem';

type ReadMutability = 'pure' | 'view';

export type ReadCall<
  abi extends Abi = Abi,
  functionName extends ContractFunctionName<abi, ReadMutability> = ContractFunctionName<abi, ReadMutability>,
  args extends ContractFunctionArgs<abi, ReadMutability, functionName> = ContractFunctionArgs<
    abi,
    ReadMutability,
    functionName
  >,
> = ContractFunctionParameters<abi, ReadMutability, functionName, args> & {
  /** msg.sender, for functions that only answer specific callers; such reads are not batched */
  account?: Address;
};

export type ReadReturn<call> =
  call extends ReadCall<infer abi, infer functionName, infer args>
    ? ContractFunctionReturnType<abi, ReadMutability, functionName, args>
    : never;

type UntypedCall = { address: Address; abi: Abi; functionName: string; args?: readonly unknown[]; account?: Address };

export type ReadResult<value> = { ok: true; value: value } | { ok: false };

/**
 * The call itself failed (reverted, or the address has no code) or returned data that does not decode with its abi,
 * as opposed to the rpc request failing.
 */
export function isCallFailure(err: unknown): boolean {
  if (!(err instanceof BaseError)) return false;
  if (!err.walk(e => e instanceof CallExecutionError)) return true;
  return err.walk(e => e instanceof RawContractError || e instanceof ExecutionRevertedError) !== null;
}

/**
 * Reads at one block, so values read together are consistent. Concurrent reads are batched into multicalls by the
 * client, and each distinct call is only made once.
 */
export class Reader {
  private readonly calls = new Map<string, Promise<Hex | undefined>>();

  constructor(
    private readonly client: PublicClient,
    readonly block: { number: bigint; timestamp: bigint }
  ) {}

  /** Rejects if the call fails or the rpc request fails */
  read<
    const abi extends Abi,
    functionName extends ContractFunctionName<abi, ReadMutability>,
    const args extends ContractFunctionArgs<abi, ReadMutability, functionName>,
  >(
    call: ReadCall<abi, functionName, args>
  ): Promise<ContractFunctionReturnType<abi, ReadMutability, functionName, args>> {
    // viem's types can't follow a generic call through to readContract; the call's own abi decodes the result
    return this.readUntyped(call as UntypedCall) as Promise<
      ContractFunctionReturnType<abi, ReadMutability, functionName, args>
    >;
  }

  /** `ok: false` if the call fails, rejects if the rpc request fails */
  async tryRead<
    const abi extends Abi,
    functionName extends ContractFunctionName<abi, ReadMutability>,
    const args extends ContractFunctionArgs<abi, ReadMutability, functionName>,
  >(
    call: ReadCall<abi, functionName, args>
  ): Promise<ReadResult<ContractFunctionReturnType<abi, ReadMutability, functionName, args>>> {
    try {
      return { ok: true, value: await this.read(call) };
    } catch (err) {
      if (isCallFailure(err)) return { ok: false };
      throw err;
    }
  }

  private async readUntyped({ address, abi, functionName, args, account }: UntypedCall): Promise<unknown> {
    try {
      const data = await this.callOnce(address, encodeFunctionData({ abi, functionName, args }), account);
      return decodeFunctionResult({ abi, functionName, args, data: data ?? '0x' });
    } catch (err) {
      if (!(err instanceof BaseError)) throw err;
      throw getContractError(err, { abi, address, args, functionName, sender: account });
    }
  }

  /** the same calldata can be decoded with different abis, e.g. older 3 field fee configs */
  private callOnce(to: Address, data: Hex, account: Address | undefined): Promise<Hex | undefined> {
    const key = `${to.toLowerCase()}|${account?.toLowerCase() ?? ''}|${data}`;
    let call = this.calls.get(key);
    if (!call) {
      call = this.client.call({ to, data, account, blockNumber: this.block.number }).then(result => result.data);
      this.calls.set(key, call);
    }
    return call;
  }
}
