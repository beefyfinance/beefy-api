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

type UntypedCall = { address: Address; abi: Abi; functionName: string; args?: readonly unknown[]; account?: Address };

export type ReadResult<value> = { ok: true; value: value } | { ok: false };

/** The call itself failed (reverted, or the address has no code) or returned data its abi can't decode */
export class CallFailedError extends Error {
  constructor(cause: BaseError) {
    super(cause.shortMessage, { cause });
  }
}

/**
 * Whether the call failed, rather than the rpc request. Within a multicall, a call fails on its own as a
 * RawContractError; when the whole multicall request fails, even as "execution reverted" (e.g. out of gas under the
 * node's eth_call limit), its calls can't be told apart, so that is an rpc failure.
 */
function isCallFailure(err: BaseError, batched: boolean): boolean {
  if (!err.walk(e => e instanceof CallExecutionError)) return true;
  return err.walk(e => e instanceof RawContractError || (!batched && e instanceof ExecutionRevertedError)) !== null;
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
  ) {
    // reads without an account are told apart as batched, which viem only does with both
    if (!client.batch?.multicall || !client.chain?.contracts?.multicall3) {
      throw new Error('Reader needs a client that batches reads through multicall3');
    }
  }

  /** Rejects with a CallFailedError if the call fails, or with the rpc error if the request fails */
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
      if (err instanceof CallFailedError) return { ok: false };
      throw err;
    }
  }

  private async readUntyped({ address, abi, functionName, args, account }: UntypedCall): Promise<unknown> {
    try {
      const data = await this.callOnce(address, encodeFunctionData({ abi, functionName, args }), account);
      return decodeFunctionResult({ abi, functionName, args, data: data ?? '0x' });
    } catch (err) {
      if (!(err instanceof BaseError)) throw err;
      const error = getContractError(err, { abi, address, args, functionName, sender: account });
      throw isCallFailure(error, account === undefined) ? new CallFailedError(error) : error;
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
