import { type Address, isAddressEqual, zeroAddress } from 'viem';
import type { CowVault } from '../../../vaults/types.ts';
import {
  algebraIntegralPluginAbi,
  algebraIntegralPoolAbi,
  algebraV1DataStorageAbi,
  algebraV1PoolAbi,
  camelotDataStorageAbi,
  camelotPoolAbi,
  clFactoryAbi,
  clPoolAbi,
  legacyFeeModuleAbi,
  ramsesV2PoolAbi,
  ramsesV3FactoryAbi,
  vaultAbi,
  volatilityFeeSourceAbi,
} from './abis.ts';
import { type FakeChain, type Handlers, revert } from './fake-chain.ts';

export const VAULT: Address = '0x000000000000000000000000000000000000a001';
export const POOL: Address = '0x000000000000000000000000000000000000B001';
export const FACTORY: Address = '0x000000000000000000000000000000000000C001';
export const HOOK: Address = '0x000000000000000000000000000000000000d001';
export const MODULE: Address = '0x000000000000000000000000000000000000D002';
export const PLUGIN: Address = '0x000000000000000000000000000000000000e001';
export const DATA_STORAGE: Address = '0x000000000000000000000000000000000000e002';
export const ACCESS_HUB: Address = '0x000000000000000000000000000000000000F001';

export const ZERO_FEE_INDICATOR = 420n;
export const TICK_SPACING_FEE = 500;
const Q96 = 2n ** 96n;

export function cowVault(id: string, earnContractAddress: Address, tokenAddress?: Address): CowVault {
  return { id, earnContractAddress, tokenAddress } as CowVault;
}

/** a vault contract whose want() is the pool */
export function vaultFor(chain: FakeChain, pool: Address, id = 'vault', address: Address = VAULT): CowVault {
  chain.deploy(address, vaultAbi, { want: () => pool });
  return cowVault(id, address);
}

export function fixedPool(chain: FakeChain, fee: number | undefined, pool: Address = POOL): Address {
  chain.deploy(FACTORY, clFactoryAbi, {});
  return chain.deploy(pool, clPoolAbi, {
    factory: () => FACTORY,
    fee: fee === undefined ? undefined : () => fee,
  });
}

export const isPool = (pool: Address) => isAddressEqual(pool, POOL);

/** base 400 + |tick 100 - twap 0| * 10 = 1400, cap 10_000 */
export const volatileConfig = [400, 10_000, 10_000_000n, false, 0] as const;

export type VolatilitySetup = {
  pool?: Handlers<typeof clPoolAbi>;
  factory?: Handlers<typeof clFactoryAbi>;
  source?: Handlers<typeof volatilityFeeSourceAbi>;
  /** deploy the source with the 3 field dynamicFeeConfig instead */
  legacySource?: Handlers<typeof legacyFeeModuleAbi>;
};

function volatilityPool(chain: FakeChain, source: Address, setup: VolatilitySetup) {
  chain.deploy(POOL, clPoolAbi, {
    factory: () => FACTORY,
    fee: () => 3000,
    tickSpacing: () => 100,
    slot0: () => [Q96, 100, 0, 100, 100, true],
    observe: ([secondsAgos]) =>
      secondsAgos[0] === 120 && secondsAgos[1] === 0
        ? [
            [0n, 0n],
            [0n, 0n],
          ]
        : revert(),
    ...setup.pool,
  });
  chain.deploy(FACTORY, clFactoryAbi, {
    tickSpacingToFee: ([tickSpacing]) => (tickSpacing === 100 ? TICK_SPACING_FEE : revert()),
    ...setup.factory,
  });
  const sourceGetters = {
    ZERO_FEE_INDICATOR: () => ZERO_FEE_INDICATOR,
    defaultScalingFactor: () => 0n,
    defaultFeeCap: () => 50_000n,
    secondsAgo: () => 120,
  };
  if (setup.legacySource) {
    chain.deploy(source, legacyFeeModuleAbi, {
      ...sourceGetters,
      dynamicFeeConfig: ([pool]) => (isPool(pool) ? [400, 10_000, 10_000_000n] : revert()),
      ...setup.legacySource,
    });
  } else {
    chain.deploy(source, volatilityFeeSourceAbi, {
      ...sourceGetters,
      dynamicFeeConfig: ([pool]) => (isPool(pool) ? volatileConfig : revert()),
      ...setup.source,
    });
  }
}

/** Aero CL pool with a DynamicSwapFeeHook, fee 1400 pips by default */
export function aeroHookPool(chain: FakeChain, setup: VolatilitySetup = {}): Address {
  volatilityPool(chain, HOOK, {
    ...setup,
    factory: { getPoolSwapHook: ([pool]) => (isPool(pool) ? HOOK : zeroAddress), ...setup.factory },
  });
  return POOL;
}

/** Slipstream CL pool with a factory wide DynamicSwapFeeModule, fee 1400 pips by default */
export function slipstreamModulePool(chain: FakeChain, setup: VolatilitySetup = {}): Address {
  volatilityPool(chain, MODULE, { ...setup, factory: { swapFeeModule: () => MODULE, ...setup.factory } });
  return POOL;
}

export const integralFeeConfig = [2900, 12_000, 360, 60_000, 59, 8500, 100] as const;

export type AlgebraIntegralSetup = {
  pool?: Handlers<typeof algebraIntegralPoolAbi>;
  plugin?: Handlers<typeof algebraIntegralPluginAbi>;
};

/** Algebra Integral pool with an adaptive fee plugin: fee 300, range 100..15_000 */
export function algebraIntegralPool(chain: FakeChain, setup: AlgebraIntegralSetup = {}): Address {
  chain.deploy(FACTORY, clFactoryAbi, {});
  chain.deploy(PLUGIN, algebraIntegralPluginAbi, {
    getCurrentFee: () => 300,
    feeConfig: () => integralFeeConfig,
    ...setup.plugin,
  });
  return chain.deploy(POOL, algebraIntegralPoolAbi, {
    factory: () => FACTORY,
    tickSpacing: () => 60,
    plugin: () => PLUGIN,
    globalState: () => [Q96, 0, 100, 0x81, 0, true],
    ...setup.pool,
  });
}

/** range 100..15_000 */
export const algebraV1FeeConfig = [2900, 12_000, 360, 60_000, 59, 8500, 0, 10, 100] as const;
const V1_TICK = -50;
const V1_TIMEPOINT = 7;
const V1_LIQUIDITY = 10n ** 18n;

export type AlgebraV1Setup = {
  pool?: Handlers<typeof algebraV1PoolAbi>;
  dataStorage?: Handlers<typeof algebraV1DataStorageAbi>;
};

/** getFee only answers the pool, for the pool's current state */
function isCurrentStateFromPool(chain: FakeChain, args: readonly [number, number, number, bigint], from: Address) {
  const [time, tick, index, liquidity] = args;
  return (
    isPool(from)
    && time === Number(chain.timestamp)
    && tick === V1_TICK
    && index === V1_TIMEPOINT
    && liquidity === V1_LIQUIDITY
  );
}

/** Thena style Algebra v1 pool: fee 420, range 100..15_000 */
export function algebraV1Pool(chain: FakeChain, setup: AlgebraV1Setup = {}): Address {
  chain.deploy(FACTORY, clFactoryAbi, {});
  chain.deploy(DATA_STORAGE, algebraV1DataStorageAbi, {
    feeConfig: () => algebraV1FeeConfig,
    getFee: (args, from) => (isCurrentStateFromPool(chain, args, from) ? 420 : revert()),
    ...setup.dataStorage,
  });
  return chain.deploy(POOL, algebraV1PoolAbi, {
    factory: () => FACTORY,
    tickSpacing: () => 60,
    dataStorageOperator: () => DATA_STORAGE,
    liquidity: () => V1_LIQUIDITY,
    globalState: () => [Q96, V1_TICK, 999, V1_TIMEPOINT, 0, 0, true],
    ...setup.pool,
  });
}

export type CamelotSetup = {
  pool?: Handlers<typeof camelotPoolAbi>;
  dataStorage?: Handlers<typeof camelotDataStorageAbi>;
};

/** Camelot directional pool: fees 300 / 450, ranges 100..15_000 and 200..3200 */
export function camelotPool(chain: FakeChain, setup: CamelotSetup = {}): Address {
  chain.deploy(FACTORY, clFactoryAbi, {});
  chain.deploy(DATA_STORAGE, camelotDataStorageAbi, {
    feeConfigZto: () => algebraV1FeeConfig,
    feeConfigOtz: () => [1000, 2000, 360, 60_000, 59, 8500, 0, 10, 200],
    getFees: (args, from) => (isCurrentStateFromPool(chain, args, from) ? [300, 450] : revert()),
    ...setup.dataStorage,
  });
  return chain.deploy(POOL, camelotPoolAbi, {
    factory: () => FACTORY,
    tickSpacing: () => 60,
    dataStorageOperator: () => DATA_STORAGE,
    liquidity: () => V1_LIQUIDITY,
    globalState: () => [Q96, V1_TICK, 111, 222, V1_TIMEPOINT, 0, 0, true],
    ...setup.pool,
  });
}

/** Ramses v2 pool: fee() is the creation tier 3000, currentFee() 2500 is what swaps pay */
export function ramsesV2Pool(chain: FakeChain, pool: Handlers<typeof ramsesV2PoolAbi> = {}): Address {
  chain.deploy(FACTORY, clFactoryAbi, {});
  return chain.deploy(POOL, ramsesV2PoolAbi, {
    factory: () => FACTORY,
    fee: () => 3000,
    currentFee: () => 2500,
    ...pool,
  });
}

/** Ramses v3 pool: the factory has an access hub, fee() 3000 is set by a keeper */
export function ramsesV3Pool(chain: FakeChain, pool: Handlers<typeof clPoolAbi> = {}): Address {
  chain.deploy(FACTORY, ramsesV3FactoryAbi, { accessHub: () => ACCESS_HUB });
  return chain.deploy(POOL, clPoolAbi, { factory: () => FACTORY, fee: () => 3000, tickSpacing: () => 60, ...pool });
}
