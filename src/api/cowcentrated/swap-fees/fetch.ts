import { chunk, uniq } from 'lodash-es';
import {
  type Abi,
  type Address,
  decodeFunctionResult,
  encodeFunctionData,
  isAddress,
  multicall3Abi,
  type PublicClient,
  parseAbi,
  zeroAddress,
} from 'viem';
import type { ApiChain } from '../../../utils/chain.ts';
import { toChainId } from '../../../utils/chain.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { getRPCClient } from '../../rpc/client.ts';
import type { CowVault } from '../../vaults/types.ts';
import {
  type AlgebraSigmoids,
  type AlgebraV1FeeConfig,
  aeroHookFee,
  algebraFee,
  algebraIntegralRange,
  algebraV1Range,
  fixedFee,
  isAlgebraIntegralFeeActive,
  managedFee,
  slipstreamModuleFee,
  twapTick,
  type VolatilityFeeConfig,
} from './math.ts';
import type { ClmSwapFee, ClmSwapFees } from './types.ts';

const logger = getLoggerFor({ module: 'clm', component: 'swap-fees' });

const CALLS_PER_MULTICALL = 100;
/** read a few blocks behind latest so every fallback rpc has the block */
const BLOCK_LAG = 5n;

const vaultAbi = parseAbi(['function want() view returns (address)']);
const poolAbi = parseAbi([
  'function factory() view returns (address)',
  'function fee() view returns (uint24)',
  'function tickSpacing() view returns (int24)',
  'function plugin() view returns (address)',
  'function dataStorageOperator() view returns (address)',
  'function currentFee() view returns (uint24)',
  'function liquidity() view returns (uint128)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
  'function observe(uint32[] secondsAgos) view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)',
]);
const factoryAbi = parseAbi([
  'function getPoolSwapHook(address pool) view returns (address)',
  'function swapFeeModule() view returns (address)',
  'function accessHub() view returns (address)',
  'function tickSpacingToFee(int24 tickSpacing) view returns (uint24)',
]);
const volatilityFeeSourceAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor, bool initialFeeEnabled, uint24 initialFee)',
  'function ZERO_FEE_INDICATOR() view returns (uint256)',
  'function defaultScalingFactor() view returns (uint256)',
  'function defaultFeeCap() view returns (uint256)',
  'function secondsAgo() view returns (uint32)',
]);
// older modules return only the first 3 fields; decoding those with the 5 field abi fails, the reverse would truncate
const legacyFeeModuleAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor)',
]);
const algebraV1FeeConfig =
  '(uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)';
const algebraV1Abi = parseAbi([
  `function feeConfig() view returns ${algebraV1FeeConfig}`,
  `function feeConfigZto() view returns ${algebraV1FeeConfig}`,
  `function feeConfigOtz() view returns ${algebraV1FeeConfig}`,
  'function getFee(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 fee)',
  'function getFees(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 feeZto, uint16 feeOtz)',
]);
const camelotPoolAbi = parseAbi([
  'function globalState() view returns (uint160 price, int24 tick, uint16 feeZto, uint16 feeOtz, uint16 timepointIndex, uint8 communityFeeToken0, uint8 communityFeeToken1, bool unlocked)',
]);
const algebraV1PoolAbi = parseAbi([
  'function globalState() view returns (uint160 price, int24 tick, uint16 fee, uint16 timepointIndex, uint16 communityFeeToken0, uint16 communityFeeToken1, bool unlocked)',
]);
const algebraIntegralPoolAbi = parseAbi([
  'function globalState() view returns (uint160 price, int24 tick, uint16 lastFee, uint8 pluginConfig, uint16 communityFee, bool unlocked)',
]);
const algebraIntegralPluginAbi = parseAbi([
  'function getCurrentFee() view returns (uint16)',
  'function feeConfig() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint16 baseFee)',
]);

type Call = { address: Address; abi: Abi; functionName: string; args?: readonly unknown[] };

/** All reads at one block, so the fee inputs are consistent with each other */
class PinnedReader {
  constructor(
    protected client: PublicClient,
    public readonly blockNumber: bigint
  ) {}

  /**
   * Result per call, undefined where it reverted, did not decode or was skipped; rejects if an rpc request fails.
   * Calls aggregate3 directly as viem's multicall reports a failed rpc request as reverted calls,
   * which would make a pool look like it lacks a fee source.
   */
  async multicall(calls: (Call | undefined)[]): Promise<unknown[]> {
    const multicallAddress = this.client.chain?.contracts?.multicall3?.address;
    if (!multicallAddress) throw new Error('No multicall3 address');

    const present = calls.flatMap((call, index) => (call ? [{ call, index }] : []));
    const batches = await Promise.all(
      chunk(present, CALLS_PER_MULTICALL).map(batch =>
        this.client.readContract({
          address: multicallAddress,
          abi: multicall3Abi,
          functionName: 'aggregate3',
          args: [
            batch.map(({ call }) => ({
              target: call.address,
              allowFailure: true,
              callData: encodeFunctionData(call),
            })),
          ],
          blockNumber: this.blockNumber,
        })
      )
    );
    const results: unknown[] = calls.map(() => undefined);
    batches.flat().forEach(({ success, returnData }, i) => {
      const { call, index } = present[i];
      if (!success) return;
      try {
        results[index] = decodeFunctionResult({ ...call, data: returnData });
      } catch {
        // e.g. an older dynamicFeeConfig with fewer fields
      }
    });
    return results;
  }

  /** eth_call from a specific address, undefined on any error */
  async readFrom(account: Address, call: Call): Promise<unknown> {
    try {
      return await this.client.readContract({ ...call, account, blockNumber: this.blockNumber });
    } catch {
      return undefined;
    }
  }
}

function isContract(value: unknown): value is Address {
  return typeof value === 'string' && isAddress(value) && value !== zeroAddress;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

type Pool = {
  vaultId: string;
  address: Address;
  factory: Address | undefined;
  fee: number | undefined;
  tickSpacing: number | undefined;
};

type PoolKind =
  | { kind: 'fixed' }
  | { kind: 'ramses-v2'; currentFee: number }
  | { kind: 'ramses-v3' }
  | { kind: 'aero-hook'; source: Address }
  | { kind: 'slipstream-module'; source: Address }
  | { kind: 'algebra-v1'; dataStorageOperator: Address }
  | { kind: 'algebra-integral'; plugin: Address };

type ClassifiedPool = Pool & PoolKind;

/** Fee of each vault's pool, leaving out vaults where a read failed */
export async function fetchChainSwapFees(chain: ApiChain, vaults: CowVault[]): Promise<ClmSwapFees> {
  const client = getRPCClient(toChainId(chain));
  const block = await client.getBlock({ blockNumber: (await client.getBlockNumber()) - BLOCK_LAG });
  const reader = new PinnedReader(client, block.number);

  const pools = await classifyPools(reader, vaults);
  const byKind = <K extends PoolKind['kind']>(kind: K) =>
    pools.filter((pool): pool is Pool & Extract<PoolKind, { kind: K }> => pool.kind === kind);

  const fees: ClmSwapFees = {};
  for (const pool of byKind('fixed')) {
    if (pool.fee !== undefined) fees[pool.vaultId] = fixedFee(pool.fee);
  }
  for (const pool of byKind('ramses-v2')) {
    fees[pool.vaultId] = managedFee(pool.currentFee);
  }
  for (const pool of byKind('ramses-v3')) {
    if (pool.fee !== undefined) fees[pool.vaultId] = managedFee(pool.fee);
  }

  const [volatilityFees, algebraV1Fees, algebraIntegralFees] = await Promise.all([
    fetchVolatilityFees(reader, [...byKind('aero-hook'), ...byKind('slipstream-module')]),
    fetchAlgebraV1Fees(reader, Number(block.timestamp), byKind('algebra-v1')),
    fetchAlgebraIntegralFees(reader, byKind('algebra-integral')),
  ]);
  Object.assign(fees, volatilityFees, algebraV1Fees, algebraIntegralFees);

  const missing = vaults.filter(vault => !fees[vault.id]).map(vault => vault.id);
  if (missing.length) {
    logger.warn({ chain, count: missing.length, vaults: missing }, 'could not read swap fee');
  }
  return fees;
}

/** Each AMM keeps its fee somewhere else, so probe the pool and its factory for each known fee source */
async function classifyPools(reader: PinnedReader, vaults: CowVault[]): Promise<ClassifiedPool[]> {
  // want() is the pool the strategy actually uses, the config tokenAddress is wrong for some old vaults
  const wants = await reader.multicall(
    vaults.map(vault => ({ address: vault.earnContractAddress, abi: vaultAbi, functionName: 'want' }))
  );
  const poolAddresses = vaults.map((vault, i) => {
    const want = wants[i];
    return isContract(want) ? want : vault.tokenAddress || undefined;
  });

  const poolFunctions = ['factory', 'fee', 'tickSpacing', 'plugin', 'dataStorageOperator', 'currentFee'] as const;
  const poolResults = await reader.multicall(
    poolAddresses.flatMap(address =>
      poolFunctions.map(functionName => (address ? { address, abi: poolAbi, functionName } : undefined))
    )
  );
  const poolResult = (i: number, functionName: (typeof poolFunctions)[number]) =>
    poolResults[i * poolFunctions.length + poolFunctions.indexOf(functionName)];

  const factories = uniq(poolAddresses.map((_, i) => poolResult(i, 'factory')).filter(isContract));
  const [hooks, factoryResults] = await Promise.all([
    reader.multicall(
      poolAddresses.map((address, i) => {
        const factory = poolResult(i, 'factory');
        return address && isContract(factory)
          ? { address: factory, abi: factoryAbi, functionName: 'getPoolSwapHook', args: [address] }
          : undefined;
      })
    ),
    reader.multicall(
      factories.flatMap(address => [
        { address, abi: factoryAbi, functionName: 'swapFeeModule' },
        { address, abi: factoryAbi, functionName: 'accessHub' },
      ])
    ),
  ]);
  const feeModules = new Map(factories.map((factory, i) => [factory, factoryResults[i * 2]]));
  const accessHubs = new Map(factories.map((factory, i) => [factory, factoryResults[i * 2 + 1]]));

  return vaults.flatMap((vault, i): ClassifiedPool[] => {
    const address = poolAddresses[i];
    if (!address) return [];
    const factory = poolResult(i, 'factory');
    const fee = poolResult(i, 'fee');
    const tickSpacing = poolResult(i, 'tickSpacing');
    const plugin = poolResult(i, 'plugin');
    const dataStorageOperator = poolResult(i, 'dataStorageOperator');
    const currentFee = poolResult(i, 'currentFee');
    const feeModule = isContract(factory) ? feeModules.get(factory) : undefined;
    const pool: Pool = {
      vaultId: vault.id,
      address,
      factory: isContract(factory) ? factory : undefined,
      fee: isNumber(fee) ? fee : undefined,
      tickSpacing: isNumber(tickSpacing) ? tickSpacing : undefined,
    };

    // aero pools use a swap hook, classic slipstream a factory-wide fee module
    if (isContract(hooks[i])) return [{ ...pool, kind: 'aero-hook', source: hooks[i] }];
    if (isContract(feeModule)) return [{ ...pool, kind: 'slipstream-module', source: feeModule }];
    if (isContract(plugin)) return [{ ...pool, kind: 'algebra-integral', plugin }];
    if (isContract(dataStorageOperator)) return [{ ...pool, kind: 'algebra-v1', dataStorageOperator }];
    // ramses v2 fee() is the creation tier, currentFee() is what swaps pay
    if (isNumber(currentFee)) return [{ ...pool, kind: 'ramses-v2', currentFee }];
    if (pool.factory && isContract(accessHubs.get(pool.factory))) return [{ ...pool, kind: 'ramses-v3' }];
    return [{ ...pool, kind: 'fixed' }];
  });
}

type VolatilityFeePool = ClassifiedPool & { kind: 'aero-hook' | 'slipstream-module'; source: Address };

/** Slipstream module and Aero hook pools: recompute the fee from config + twap rather than reading pool.fee() */
async function fetchVolatilityFees(reader: PinnedReader, pools: VolatilityFeePool[]): Promise<ClmSwapFees> {
  if (!pools.length) return {};

  const sources = uniq(pools.map(pool => pool.source));
  const sourceFunctions = ['ZERO_FEE_INDICATOR', 'defaultScalingFactor', 'defaultFeeCap', 'secondsAgo'] as const;
  const [sourceResults, configs, legacyConfigs, slot0s, tickSpacingFees] = await Promise.all([
    reader.multicall(
      sources.flatMap(address =>
        sourceFunctions.map(functionName => ({ address, abi: volatilityFeeSourceAbi, functionName }))
      )
    ),
    reader.multicall(
      pools.map(pool => ({
        address: pool.source,
        abi: volatilityFeeSourceAbi,
        functionName: 'dynamicFeeConfig',
        args: [pool.address],
      }))
    ),
    reader.multicall(
      pools.map(pool =>
        pool.kind === 'slipstream-module'
          ? { address: pool.source, abi: legacyFeeModuleAbi, functionName: 'dynamicFeeConfig', args: [pool.address] }
          : undefined
      )
    ),
    reader.multicall(pools.map(pool => ({ address: pool.address, abi: poolAbi, functionName: 'slot0' }))),
    reader.multicall(
      pools.map(pool =>
        pool.factory && pool.tickSpacing !== undefined
          ? { address: pool.factory, abi: factoryAbi, functionName: 'tickSpacingToFee', args: [pool.tickSpacing] }
          : undefined
      )
    ),
  ]);
  const sourceResult = (source: Address, functionName: (typeof sourceFunctions)[number]) =>
    sourceResults[sources.indexOf(source) * sourceFunctions.length + sourceFunctions.indexOf(functionName)];

  const inputs = pools.map((pool, i) => {
    const rawConfig = (configs[i] ?? legacyConfigs[i]) as readonly unknown[] | undefined;
    const slot0 = slot0s[i] as readonly unknown[] | undefined;
    const tickSpacingFee = tickSpacingFees[i];
    const defaultScalingFactor = sourceResult(pool.source, 'defaultScalingFactor');
    const defaultFeeCap = sourceResult(pool.source, 'defaultFeeCap');
    const secondsAgo = sourceResult(pool.source, 'secondsAgo');
    const zeroFeeIndicator = sourceResult(pool.source, 'ZERO_FEE_INDICATOR');
    if (
      !rawConfig
      || !slot0
      || !isNumber(tickSpacingFee)
      || typeof defaultScalingFactor !== 'bigint'
      || typeof defaultFeeCap !== 'bigint'
      || !isNumber(secondsAgo)
    ) {
      return undefined;
    }

    const config: VolatilityFeeConfig = {
      baseFee: rawConfig[0] as number,
      feeCap: rawConfig[1] as number,
      scalingFactor: rawConfig[2] as bigint,
      initialFeeEnabled: rawConfig[3] as boolean | undefined,
      initialFee: rawConfig[4] as number | undefined,
    };
    const scalingFactor = config.scalingFactor || defaultScalingFactor;
    const observationCardinality = slot0[3] as number;
    // modules skip the volatility part until the pool keeps enough observations
    const canObserve =
      scalingFactor > 0n
      && secondsAgo > 0
      && (pool.kind === 'aero-hook' || observationCardinality >= Math.floor(secondsAgo / 2));

    return {
      pool,
      canObserve,
      secondsAgo,
      params: {
        config,
        zeroFeeIndicator: typeof zeroFeeIndicator === 'bigint' ? Number(zeroFeeIndicator) : undefined,
        defaultScalingFactor,
        defaultFeeCap: Number(defaultFeeCap),
        tickSpacingFee,
        tick: slot0[1] as number,
      },
    };
  });

  // a reverting observe (not enough history) means no volatility part, same as on-chain
  const observations = await reader.multicall(
    inputs.map(input =>
      input?.canObserve
        ? { address: input.pool.address, abi: poolAbi, functionName: 'observe', args: [[input.secondsAgo, 0]] }
        : undefined
    )
  );

  const fees: ClmSwapFees = {};
  inputs.forEach((input, i) => {
    if (!input) return;
    const tickCumulatives = (observations[i] as readonly [readonly bigint[], unknown] | undefined)?.[0];
    const params = {
      ...input.params,
      twapTick: tickCumulatives
        ? twapTick(tickCumulatives, input.secondsAgo, input.pool.kind === 'aero-hook' ? 'floor' : 'truncate')
        : undefined,
    };
    fees[input.pool.vaultId] = input.pool.kind === 'aero-hook' ? aeroHookFee(params) : slipstreamModuleFee(params);
  });

  // custom fee modules have no dynamicFeeConfig, they charge a fixed fee per pool and pool.fee() is live
  pools.forEach((pool, i) => {
    if (pool.kind === 'slipstream-module' && !configs[i] && !legacyConfigs[i] && pool.fee !== undefined) {
      fees[pool.vaultId] = fixedFee(pool.fee);
    }
  });
  return fees;
}

function toAlgebraV1FeeConfig(raw: unknown): AlgebraV1FeeConfig | undefined {
  if (!Array.isArray(raw)) return undefined;
  const [alpha1, alpha2, beta1, beta2, gamma1, gamma2, volumeBeta, volumeGamma, baseFee] = raw as number[];
  return { alpha1, alpha2, beta1, beta2, gamma1, gamma2, volumeBeta, volumeGamma, baseFee };
}

/**
 * Algebra v1 (camelot directional, thena): the fee in globalState is from the last swap, so ask the data storage operator
 * what a swap would pay now. It leaves out volume swapped since the last timepoint, so can be a few pips off.
 */
async function fetchAlgebraV1Fees(
  reader: PinnedReader,
  timestamp: number,
  pools: (ClassifiedPool & { kind: 'algebra-v1'; dataStorageOperator: Address })[]
): Promise<ClmSwapFees> {
  if (!pools.length) return {};

  const configFunctions = ['feeConfig', 'feeConfigZto', 'feeConfigOtz'] as const;
  const [configResults, camelotStates, algebraStates, liquidities] = await Promise.all([
    reader.multicall(
      pools.flatMap(pool =>
        configFunctions.map(functionName => ({ address: pool.dataStorageOperator, abi: algebraV1Abi, functionName }))
      )
    ),
    reader.multicall(pools.map(pool => ({ address: pool.address, abi: camelotPoolAbi, functionName: 'globalState' }))),
    reader.multicall(
      pools.map(pool => ({ address: pool.address, abi: algebraV1PoolAbi, functionName: 'globalState' }))
    ),
    reader.multicall(pools.map(pool => ({ address: pool.address, abi: poolAbi, functionName: 'liquidity' }))),
  ]);

  const fees = await Promise.all(
    pools.map(async (pool, i): Promise<[string, ClmSwapFee] | undefined> => {
      const [config, configZto, configOtz] = configFunctions.map((_, j) =>
        toAlgebraV1FeeConfig(configResults[i * configFunctions.length + j])
      );
      const isDirectional = configZto !== undefined && configOtz !== undefined;
      const state = (isDirectional ? camelotStates[i] : algebraStates[i]) as readonly unknown[] | undefined;
      const liquidity = liquidities[i];
      const feeConfigs = isDirectional ? [configZto, configOtz] : config ? [config] : [];
      if (!state || typeof liquidity !== 'bigint' || !feeConfigs.length) return undefined;

      // getFee(s) is onlyPool, so it can't go through multicall
      const tick = state[1];
      const timepointIndex = isDirectional ? state[4] : state[3];
      const current = await reader.readFrom(pool.address, {
        address: pool.dataStorageOperator,
        abi: algebraV1Abi,
        functionName: isDirectional ? 'getFees' : 'getFee',
        args: [timestamp, tick, timepointIndex, liquidity],
      });
      // directional pools charge per swap direction, show the higher like the strategy does
      const currentFee = isDirectional ? Math.max(...((current as number[] | undefined) ?? [])) : current;
      if (!isNumber(currentFee) || !Number.isFinite(currentFee)) return undefined;

      return [pool.vaultId, algebraFee(currentFee, feeConfigs.map(algebraV1Range))];
    })
  );
  return Object.fromEntries(fees.filter(fee => fee !== undefined));
}

/** Algebra Integral: the plugin only sets the fee if the pool has both its before-swap and dynamic fee flags on */
async function fetchAlgebraIntegralFees(
  reader: PinnedReader,
  pools: (ClassifiedPool & { kind: 'algebra-integral'; plugin: Address })[]
): Promise<ClmSwapFees> {
  if (!pools.length) return {};

  const [states, currentFees, configs] = await Promise.all([
    reader.multicall(
      pools.map(pool => ({ address: pool.address, abi: algebraIntegralPoolAbi, functionName: 'globalState' }))
    ),
    reader.multicall(
      pools.map(pool => ({ address: pool.plugin, abi: algebraIntegralPluginAbi, functionName: 'getCurrentFee' }))
    ),
    reader.multicall(
      pools.map(pool => ({ address: pool.plugin, abi: algebraIntegralPluginAbi, functionName: 'feeConfig' }))
    ),
  ]);

  const fees: ClmSwapFees = {};
  pools.forEach((pool, i) => {
    const state = states[i] as readonly unknown[] | undefined;
    if (!state) return;
    const lastFee = state[2] as number;
    const pluginConfig = state[3] as number;
    // otherwise swaps keep paying the stored fee
    if (!isAlgebraIntegralFeeActive(pluginConfig)) {
      fees[pool.vaultId] = fixedFee(lastFee);
      return;
    }

    const currentFee = currentFees[i];
    const rawConfig = configs[i] as readonly number[] | undefined;
    if (!isNumber(currentFee) || !rawConfig) {
      // not the adaptive fee plugin, so its bounds are unknown
      fees[pool.vaultId] = managedFee(isNumber(currentFee) ? currentFee : lastFee);
      return;
    }
    const [alpha1, alpha2, beta1, beta2, gamma1, gamma2, baseFee] = rawConfig;
    const config: AlgebraSigmoids = { alpha1, alpha2, beta1, beta2, gamma1, gamma2, baseFee };
    fees[pool.vaultId] = algebraFee(currentFee, [algebraIntegralRange(config)]);
  });
  return fees;
}
