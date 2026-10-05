import { addressBook } from '@beefyfinance/blockchain-addressbook';
import type { Context } from 'koa';
import { pick } from 'lodash-es';
import { type ApiChain, isApiChain } from '../../utils/chain.ts';
import { postJson } from '../../utils/http/index.ts';
import { sendBadRequest, sendInternalServerError, sendSuccess } from '../../utils/koa.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';

const logger = getLoggerFor({ module: 'beefy-bridge', component: 'axelar' });

const CACHE_TTL_MS = 10_000;
const REQUEST_TIMEOUT_MS = 10_000;

// sample execute() payload, used by axelar to estimate L1 fee on OP-stack destinations
const EXECUTE_DATA =
  '0x491606584b113024bee25390d17740a2cee6c07cd36882ea70a2ad9026e8fd37050848a5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000086f7074696d69736d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078616161364132373966433938623962463934624434373943393044373031343137653336316663320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000002e56843c42bd166e37fc3f6e94de6d2c0ff7b89c0000000000000000000000000000000000000000000000004f8401842f1da464';

type AxelarBridgeChainConfig = {
  axelarChain: string;
  gasToken: string;
  incomingGasLimit: string;
};

const chains = {
  ethereum: {
    axelarChain: 'ethereum',
    gasToken: 'ETH',
    incomingGasLimit: '170000',
  },
  optimism: {
    axelarChain: 'optimism',
    gasToken: 'ETH',
    incomingGasLimit: '170000',
  },
  base: {
    axelarChain: 'base',
    gasToken: 'ETH',
    incomingGasLimit: '170000',
  },
} as const satisfies Partial<Record<ApiChain, AxelarBridgeChainConfig>>;

type AxelarBridgeChain = keyof typeof chains;
type ChainPairKey = `${AxelarBridgeChain}-${AxelarBridgeChain}`;

type EstimateGasFeeResponse = {
  totalFee: string;
  isExpressSupported: boolean;
  baseFee: string;
  expressFee: string;
  executionFee: string;
  executionFeeWithMultiplier: string;
  gasLimit: string;
  gasLimitWithL1Fee: string;
  gasMultiplier: number;
  minGasPrice: string;
};

const responseFields = [
  'totalFee',
  'isExpressSupported',
  'baseFee',
  'expressFee',
  'executionFee',
  'executionFeeWithMultiplier',
  'gasLimit',
  'gasLimitWithL1Fee',
  'gasMultiplier',
  'minGasPrice',
] as const satisfies ReadonlyArray<keyof EstimateGasFeeResponse>;

const cache = new Map<ChainPairKey, { expiresAt: number; promise: Promise<EstimateGasFeeResponse> }>();

function isAxelarBridgeChain(chainId: ApiChain): chainId is AxelarBridgeChain {
  return Object.hasOwn(chains, chainId);
}

function getChainParam(ctx: Context, name: 'sourceChainId' | 'destChainId'): AxelarBridgeChain | undefined {
  const chainId: unknown = ctx.params[name];
  return typeof chainId === 'string' && isApiChain(chainId) && isAxelarBridgeChain(chainId) ? chainId : undefined;
}

async function fetchEstimateGasFee(
  sourceChainId: AxelarBridgeChain,
  destChainId: AxelarBridgeChain
): Promise<EstimateGasFeeResponse> {
  const source = chains[sourceChainId];
  const dest = chains[destChainId];
  const destBridge = addressBook[destChainId].platforms.beefyfinance.axelarBridge;
  if (!destBridge) {
    throw new Error(`No axelarBridge in address book for ${destChainId}`);
  }

  const response = await postJson<EstimateGasFeeResponse>({
    url: 'https://api.axelarscan.io/gmp/estimateGasFee',
    body: {
      sourceChain: source.axelarChain,
      sourceTokenSymbol: source.gasToken,
      destinationChain: dest.axelarChain,
      destinationContractAddress: destBridge,
      gasLimit: dest.incomingGasLimit,
      gasMultiplier: 'auto',
      executeData: EXECUTE_DATA,
      showDetailedFees: true,
    },
    timeout: REQUEST_TIMEOUT_MS,
  });

  // axelar returns 0 rather than an error for unsupported chains
  if (typeof response?.totalFee !== 'string' || !/^[1-9]\d*$/.test(response.totalFee)) {
    throw new Error(`Invalid totalFee from axelar: ${response?.totalFee}`);
  }

  return pick(response, responseFields);
}

function getEstimateGasFee(
  sourceChainId: AxelarBridgeChain,
  destChainId: AxelarBridgeChain
): Promise<EstimateGasFeeResponse> {
  const key: ChainPairKey = `${sourceChainId}-${destChainId}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = fetchEstimateGasFee(sourceChainId, destChainId);
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise });
  return promise;
}

export async function handleAxelarEstimateGasFee(ctx: Context) {
  const sourceChainId = getChainParam(ctx, 'sourceChainId');
  const destChainId = getChainParam(ctx, 'destChainId');
  if (!sourceChainId || !destChainId || sourceChainId === destChainId) {
    sendBadRequest(ctx, { error: 'Unsupported chain pair' });
    return;
  }

  try {
    sendSuccess(ctx, await getEstimateGasFee(sourceChainId, destChainId));
  } catch (err) {
    logger.error({ err, sourceChainId, destChainId }, 'estimate gas fee failed');
    sendInternalServerError(ctx, { error: 'Failed to estimate gas fee' });
  }
}
