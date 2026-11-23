import {
  type Abi,
  type AbiFunction,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type ContractFunctionReturnType,
  createPublicClient,
  custom,
  decodeFunctionData,
  defineChain,
  encodeFunctionResult,
  fallback,
  type Hex,
  isAddressEqual,
  multicall3Abi,
  type PublicClient,
  pad,
  RpcRequestError,
  toFunctionSelector,
  toHex,
} from 'viem';
import * as abis from './abis.ts';

export const MULTICALL3: Address = '0xcA11bde05977b3631167028862bE2a173976CA11';

const fakeChain = defineChain({
  id: 8453,
  name: 'Fake',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://fake.rpc'] } },
  contracts: { multicall3: { address: MULTICALL3 } },
});

type ReadName<abi extends Abi> = ContractFunctionName<abi, 'view' | 'pure'>;

export type Handlers<abi extends Abi> = {
  [name in ReadName<abi>]?: (
    args: ContractFunctionArgs<abi, 'view' | 'pure', name>,
    from: Address
  ) => ContractFunctionReturnType<abi, 'view' | 'pure', name>;
};

type FunctionImpl = { name: string; call: (data: Hex, from: Address) => Hex };

const knownFunctions = new Map(
  Object.values(abis).flatMap((abi: Abi) =>
    abi.flatMap(item => (item.type === 'function' ? [[toFunctionSelector(item), item.name] as const] : []))
  )
);

class FakeRevert extends Error {
  constructor(readonly data: Hex) {
    super('execution reverted');
  }
}

class FakeRpcFailure extends Error {
  constructor(
    readonly code: number,
    message: string
  ) {
    super(message);
  }
}

/** Revert from a handler, like a require() without a reason */
export function revert(): never {
  throw new FakeRevert('0x');
}

/** Fail the whole json-rpc request the call is part of, like a node or rate limit error */
export function rpcFailure(message = 'header not found', code = -32603): never {
  throw new FakeRpcFailure(code, message);
}

export type RecordedRead = {
  to: Address;
  /** also named for functions the contract does not have, if any test abi has them */
  functionName: string | undefined;
  /** id of the json-rpc request the read was part of */
  request: number;
  from: Address | undefined;
  block: string;
  batched: boolean;
};

/**
 * EVM node stand-in: contracts are handler maps keyed by function name.
 * Unknown selectors revert with empty data, addresses without a contract return 0x, and aggregate3 calls
 * run each inner call so batched and direct reads behave like on a real node.
 */
export class FakeChain {
  readonly latestBlock = 1000n;
  readonly timestamp = 1_800_000_000n;
  readonly reads: RecordedRead[] = [];
  readonly requests: { method: string; batchSize: number }[] = [];
  private requestId = 0;
  private readonly contracts = new Map<string, Map<Hex, FunctionImpl>>();

  /** Adds functions to the contract at address, replacing any with the same selector */
  deploy<const abi extends Abi>(address: Address, abi: abi, handlers: NoInfer<Handlers<abi>>): Address {
    const functions = this.contracts.get(address.toLowerCase()) ?? new Map<Hex, FunctionImpl>();
    for (const [name, handler] of Object.entries(handlers)) {
      if (typeof handler !== 'function') continue;
      const item = abi.find((entry): entry is AbiFunction => entry.type === 'function' && entry.name === name);
      if (!item) throw new Error(`${name} is not in the abi`);
      // the abi is only known as AbiFunction here, so the handler types cannot be checked against it
      const impl = handler as (args: readonly unknown[], from: Address) => readonly unknown[] | undefined;
      functions.set(toFunctionSelector(item), {
        name,
        call: (data, from) => {
          const { args } = decodeFunctionData({ abi: [item], data });
          const result = impl(args ?? [], from);
          return encodeFunctionResult({ abi: [item], functionName: name, result });
        },
      });
    }
    this.contracts.set(address.toLowerCase(), functions);
    return address;
  }

  client(batchWait = 0): PublicClient {
    return createPublicClient({
      chain: fakeChain,
      batch: { multicall: { batchSize: 1024, wait: batchWait } },
      transport: fallback([custom({ request: args => this.request(args) }, { retryCount: 0 })], { retryCount: 0 }),
    });
  }

  /** reads of a function, including the ones inside multicalls */
  readsOf(functionName: string): RecordedRead[] {
    return this.reads.filter(read => read.functionName === functionName);
  }

  private async request({ method, params }: { method: string; params?: unknown }): Promise<unknown> {
    switch (method) {
      case 'eth_chainId':
        return toHex(fakeChain.id);
      case 'eth_blockNumber':
        return toHex(this.latestBlock);
      case 'eth_getBlockByNumber': {
        const [number] = params as [Hex];
        return { number, hash: pad(number), timestamp: toHex(this.timestamp), transactions: [] };
      }
      case 'eth_call':
        return this.ethCall(params as [{ to: Address; data: Hex; from?: Address }, string]);
      default:
        throw new RpcRequestError({
          body: { method, params },
          error: { code: -32601, message: `${method} not supported` },
          url: 'http://fake.rpc',
        });
    }
  }

  private ethCall([{ to, data, from }, block]: [{ to: Address; data: Hex; from?: Address }, string]): Hex {
    const body = { method: 'eth_call', params: [{ to, data, from }, block] };
    const request = ++this.requestId;
    try {
      if (isAddressEqual(to, MULTICALL3)) {
        const { functionName, args } = decodeFunctionData({ abi: multicall3Abi, data });
        if (functionName !== 'aggregate3') throw new Error(`${functionName} is not supported`);
        const [calls] = args;
        this.requests.push({ method: 'aggregate3', batchSize: calls.length });
        const results = calls.map(call => {
          try {
            return { success: true, returnData: this.run(call.target, call.callData, MULTICALL3, block, request) };
          } catch (err) {
            if (err instanceof FakeRevert) return { success: false, returnData: err.data };
            throw err;
          }
        });
        return encodeFunctionResult({ abi: multicall3Abi, functionName: 'aggregate3', result: results });
      }
      this.requests.push({ method: 'eth_call', batchSize: 1 });
      return this.run(to, data, from, block, request, false);
    } catch (err) {
      if (err instanceof FakeRevert) {
        throw new RpcRequestError({
          body,
          error: { code: 3, message: 'execution reverted', data: err.data },
          url: 'http://fake.rpc',
        });
      }
      if (err instanceof FakeRpcFailure) {
        throw new RpcRequestError({ body, error: { code: err.code, message: err.message }, url: 'http://fake.rpc' });
      }
      throw err;
    }
  }

  private run(to: Address, data: Hex, from: Address | undefined, block: string, request: number, batched = true): Hex {
    const selector = data.slice(0, 10) as Hex;
    const functions = this.contracts.get(to.toLowerCase());
    const impl = functions?.get(selector);
    this.reads.push({ to, functionName: impl?.name ?? knownFunctions.get(selector), request, from, block, batched });
    if (!functions) return '0x';
    if (!impl) revert();
    return impl.call(data, from ?? '0x0000000000000000000000000000000000000000');
  }
}
