import { decodeFunctionData, encodeFunctionData, type Hex, parseAbi } from 'viem';
import { OKX_NATIVE_ADDRESS } from './types.ts';

// From okxlabs/Web3-DEX-Router-EVM-V1 DexRouter
const dexRouterAbi = parseAbi([
  'struct BaseRequest { uint256 fromToken; address toToken; uint256 fromTokenAmount; uint256 minReturnAmount; uint256 deadLine; }',
  'struct RouterPath { address[] mixAdapters; address[] assetTo; uint256[] rawData; bytes[] extraData; uint256 fromToken; }',
  'struct PMMSwapRequest { uint256 pathIndex; address payer; address fromToken; address toToken; uint256 fromTokenAmountMax; uint256 toTokenAmountMax; uint256 salt; uint256 deadLine; bool isPushOrder; bytes extension; }',
  'function smartSwapByOrderId(uint256 orderId, BaseRequest baseRequest, uint256[] batchesAmount, RouterPath[][] batches, PMMSwapRequest[] extraData) payable returns (uint256)',
  'function smartSwapTo(uint256 orderId, address receiver, BaseRequest baseRequest, uint256[] batchesAmount, RouterPath[][] batches, PMMSwapRequest[] extraData) payable returns (uint256)',
  'function dagSwapByOrderId(uint256 orderId, BaseRequest baseRequest, RouterPath[] paths) payable returns (uint256)',
  'function dagSwapTo(uint256 orderId, address receiver, BaseRequest baseRequest, RouterPath[] paths) payable returns (uint256)',
  'function unxswapByOrderId(uint256 srcToken, uint256 amount, uint256 minReturn, bytes32[] pools) payable returns (uint256)',
  'function unxswapTo(uint256 srcToken, uint256 amount, uint256 minReturn, address receiver, bytes32[] pools) payable returns (uint256)',
  'function unxswapToWithBaseRequest(uint256 orderId, address receiver, BaseRequest baseRequest, bytes32[] pools) payable returns (uint256)',
  'function uniswapV3SwapTo(uint256 receiver, uint256 amount, uint256 minReturn, uint256[] pools) payable returns (uint256)',
  'function uniswapV3SwapToWithBaseRequest(uint256 orderId, address receiver, BaseRequest baseRequest, uint256[] pools) payable returns (uint256)',
]);

const ADDRESS_MASK = (1n << 160n) - 1n;

// OKX appends commission/trim words after the abi args, flagged in the top 6 bytes of each word
const COMMISSION_FLAGS = new Set([
  '3ca20afc2aaa',
  '3ca20afc2bbb',
  '22220afc2aaa',
  '22220afc2bbb',
  '88880afc2aaa',
  '88880afc2bbb',
]);
// Positive slippage trim: output above expectAmountOut (capped at 10%) goes to okx
const TRIM_FLAG = '777777771111';
const TRIM_DUAL_FLAG = '777777772222';

export type DecodedRouterCall = {
  /** undefined means msg.sender (the zap router) */
  receiver: string | undefined;
  /** undefined when the router derives it from the pools */
  fromToken: string | undefined;
  /** undefined when the router derives it from the pools */
  toToken: string | undefined;
  amount: bigint;
  minReturn: bigint;
  /** unix seconds; undefined for variants without a deadline */
  deadline: bigint | undefined;
  /** set when okx keeps positive slippage above this amount */
  trimExpectAmountOut: bigint | undefined;
};

function toAddress(value: bigint): string {
  const address = value & ADDRESS_MASK;
  // unxswap accepts address(0) for native
  return address === 0n ? OKX_NATIVE_ADDRESS : `0x${address.toString(16).padStart(40, '0')}`;
}

function fromBaseRequest(
  receiver: string | undefined,
  baseRequest: {
    fromToken: bigint;
    toToken: string;
    fromTokenAmount: bigint;
    minReturnAmount: bigint;
    deadLine: bigint;
  }
): Omit<DecodedRouterCall, 'trimExpectAmountOut'> {
  return {
    receiver,
    fromToken: toAddress(baseRequest.fromToken),
    toToken: toAddress(BigInt(baseRequest.toToken)),
    amount: baseRequest.fromTokenAmount,
    minReturn: baseRequest.minReturnAmount,
    deadline: baseRequest.deadLine,
  };
}

function wordFlag(word: string): string {
  return word.slice(0, 12).toLowerCase();
}

/** Only a trim suffix is allowed, anything else after the abi args could redirect output */
function parseSuffix(data: Hex, argsLength: number): bigint | undefined {
  const lastFlag = wordFlag(data.slice(-64));
  const suffix = data.slice(argsLength);
  if (suffix.length === 0) {
    // The router would read the last abi word as commission/trim data
    if (COMMISSION_FLAGS.has(lastFlag) || lastFlag === TRIM_FLAG || lastFlag === TRIM_DUAL_FLAG) {
      throw new Error('ambiguous calldata suffix');
    }
    return undefined;
  }

  const words = suffix.match(/.{64}/g) ?? [];
  const expectedWords = lastFlag === TRIM_FLAG ? 2 : lastFlag === TRIM_DUAL_FLAG ? 3 : 0;
  if (
    expectedWords === 0
    || words.length !== expectedWords
    || suffix.length !== expectedWords * 64
    || words.some(word => wordFlag(word) !== lastFlag)
  ) {
    throw new Error('unexpected calldata suffix');
  }

  // words are read from the end: [chargeInfo,] expectAmountOut, trimRate+trimAddress
  return BigInt(`0x${words[words.length - 2].slice(-40)}`);
}

/** Throws if the calldata is not a known DexRouter swap */
export function decodeRouterCall(data: Hex): DecodedRouterCall {
  const decoded = decodeFunctionData({ abi: dexRouterAbi, data });
  const trimExpectAmountOut = parseSuffix(data, encodeFunctionData({ abi: dexRouterAbi, ...decoded }).length);
  return { ...decodeArgs(decoded), trimExpectAmountOut };
}

function decodeArgs({
  functionName,
  args,
}: ReturnType<typeof decodeFunctionData<typeof dexRouterAbi>>): Omit<DecodedRouterCall, 'trimExpectAmountOut'> {
  switch (functionName) {
    case 'smartSwapByOrderId':
    case 'dagSwapByOrderId':
      return fromBaseRequest(undefined, args[1]);
    case 'smartSwapTo':
    case 'dagSwapTo':
    case 'unxswapToWithBaseRequest':
    case 'uniswapV3SwapToWithBaseRequest':
      return fromBaseRequest(args[1], args[2]);
    case 'unxswapByOrderId':
      return {
        receiver: undefined,
        fromToken: toAddress(args[0]),
        toToken: undefined,
        amount: args[1],
        minReturn: args[2],
        deadline: undefined,
      };
    case 'unxswapTo':
      return {
        receiver: args[3],
        fromToken: toAddress(args[0]),
        toToken: undefined,
        amount: args[1],
        minReturn: args[2],
        deadline: undefined,
      };
    case 'uniswapV3SwapTo':
      return {
        receiver: toAddress(args[0]),
        fromToken: undefined,
        toToken: undefined,
        amount: args[1],
        minReturn: args[2],
        deadline: undefined,
      };
  }
}
