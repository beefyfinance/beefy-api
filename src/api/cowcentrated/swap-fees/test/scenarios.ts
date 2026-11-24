import { type Address, zeroAddress } from 'viem';
import type { CowVault } from '../../../vaults/types.ts';
import type { ClmSwapFees } from '../types.ts';
import {
  algebraIntegralPluginAbi,
  algebraIntegralPoolAbi,
  algebraV1DataStorageAbi,
  algebraV1PoolAbi,
  clFactoryAbi,
  clPoolAbi,
  ramsesV2PoolAbi,
  ramsesV3FactoryAbi,
  vaultAbi,
  volatilityFeeSourceAbi,
} from './abis.ts';
import { type FakeChain, revert, rpcFailure } from './fake-chain.ts';
import {
  ACCESS_HUB,
  aeroHookPool,
  algebraIntegralPool,
  algebraV1FeeConfig,
  algebraV1Pool,
  camelotPool,
  cowVault,
  DATA_STORAGE,
  FACTORY,
  fixedPool,
  HOOK,
  isPool,
  MODULE,
  PLUGIN,
  POOL,
  ramsesV2Pool,
  ramsesV3Pool,
  slipstreamModulePool,
  TICK_SPACING_FEE,
  VAULT,
  vaultFor,
} from './world.ts';

export type Scenario = {
  name: string;
  setup(chain: FakeChain): CowVault[];
  expected: ClmSwapFees;
};

const OTHER_VAULT: Address = '0x000000000000000000000000000000000000A002';
const OTHER_POOL: Address = '0x000000000000000000000000000000000000B002';

/** one vault on the pool the setup deploys */
function single(
  name: string,
  deployPool: (chain: FakeChain) => Address,
  fee: ClmSwapFees[string] | undefined
): Scenario {
  return {
    name,
    setup: chain => [vaultFor(chain, deployPool(chain))],
    expected: fee ? { vault: fee } : {},
  };
}

const dynamicFee = { current: 0.0014, dynamic: true, min: 0.0004, max: 0.01 };
const baseOnlyFee = { current: 0.0004, dynamic: true, min: 0.0004, max: 0.01 };

const poolResolution: Scenario[] = [
  single('want() is the pool', chain => fixedPool(chain, 500), { current: 0.0005, dynamic: false }),
  {
    name: 'uses tokenAddress when want() reverts',
    setup: chain => {
      fixedPool(chain, 3000);
      chain.deploy(VAULT, vaultAbi, {});
      return [cowVault('vault', VAULT, POOL)];
    },
    expected: { vault: { current: 0.003, dynamic: false } },
  },
  {
    name: 'uses tokenAddress when want() is the zero address',
    setup: chain => {
      fixedPool(chain, 3000);
      chain.deploy(VAULT, vaultAbi, { want: () => zeroAddress });
      return [cowVault('vault', VAULT, POOL)];
    },
    expected: { vault: { current: 0.003, dynamic: false } },
  },
  {
    name: 'skips a vault without a pool',
    setup: chain => {
      chain.deploy(VAULT, vaultAbi, {});
      return [cowVault('vault', VAULT)];
    },
    expected: {},
  },
  single('skips a fixed pool whose fee() reverts', chain => fixedPool(chain, undefined), undefined),
  {
    name: 'a pool without factory() is fixed',
    setup: chain => {
      chain.deploy(POOL, clPoolAbi, { fee: () => 500 });
      return [vaultFor(chain, POOL)];
    },
    expected: { vault: { current: 0.0005, dynamic: false } },
  },
];

const ramses: Scenario[] = [
  single('ramses v2: charges currentFee()', chain => ramsesV2Pool(chain), { current: 0.0025, dynamic: true }),
  single('ramses v3: charges fee(), set by a keeper', chain => ramsesV3Pool(chain), { current: 0.003, dynamic: true }),
  single('ramses v3: skipped when fee() reverts', chain => ramsesV3Pool(chain, { fee: undefined }), undefined),
];

const algebraIntegral: Scenario[] = [
  single('algebra integral: adaptive fee with its range', chain => algebraIntegralPool(chain), {
    current: 0.0003,
    dynamic: true,
    min: 0.0001,
    max: 0.015,
  }),
  single(
    'algebra integral: last fee when the dynamic fee flags are off',
    chain => algebraIntegralPool(chain, { pool: { globalState: () => [1n, 0, 100, 0x01, 0, true] } }),
    { current: 0.0001, dynamic: false }
  ),
  single(
    'algebra integral: unbounded plugin fee without an adaptive fee config',
    chain => algebraIntegralPool(chain, { plugin: { feeConfig: undefined } }),
    { current: 0.0003, dynamic: true }
  ),
  single(
    'algebra integral: last fee, unbounded, when the plugin has no current fee',
    chain => algebraIntegralPool(chain, { plugin: { getCurrentFee: undefined } }),
    { current: 0.0001, dynamic: true }
  ),
  single(
    'algebra integral: skipped when globalState() reverts',
    chain => algebraIntegralPool(chain, { pool: { globalState: undefined } }),
    undefined
  ),
];

const algebraV1: Scenario[] = [
  single('algebra v1: fee from the data storage operator, asked as the pool', chain => algebraV1Pool(chain), {
    current: 0.00042,
    dynamic: true,
    min: 0.0001,
    max: 0.015,
  }),
  single('algebra v1 directional: the higher fee, over both ranges', chain => camelotPool(chain), {
    current: 0.00045,
    dynamic: true,
    min: 0.0001,
    max: 0.015,
  }),
  single(
    'algebra v1: skipped without a fee config',
    chain => algebraV1Pool(chain, { dataStorage: { feeConfig: undefined } }),
    undefined
  ),
  single(
    'algebra v1 directional: skipped with only one direction configured',
    chain => camelotPool(chain, { dataStorage: { feeConfigOtz: undefined } }),
    undefined
  ),
  single(
    'algebra v1 directional: skipped when getFees() reverts',
    chain => camelotPool(chain, { dataStorage: { getFees: () => revert() } }),
    undefined
  ),
  single(
    'algebra v1: skipped when getFee() reverts',
    chain => algebraV1Pool(chain, { dataStorage: { getFee: () => revert() } }),
    undefined
  ),
  single(
    'algebra v1: skipped when liquidity() reverts',
    chain => algebraV1Pool(chain, { pool: { liquidity: undefined } }),
    undefined
  ),
  single(
    'algebra v1: skipped when globalState() reverts',
    chain => algebraV1Pool(chain, { pool: { globalState: undefined } }),
    undefined
  ),
];

const configured = (config: readonly [number, number, bigint, boolean, number]) => ({
  dynamicFeeConfig: ([pool]: readonly [Address]) => (isPool(pool) ? config : revert()),
});

const slipstream: Scenario[] = [
  single('slipstream: base + volatility fee', chain => slipstreamModulePool(chain), dynamicFee),
  single('slipstream: 3 field legacy config', chain => slipstreamModulePool(chain, { legacySource: {} }), dynamicFee),
  single(
    'slipstream: initial fee defaults to the base fee',
    chain => slipstreamModulePool(chain, { source: configured([400, 10_000, 10_000_000n, true, 0]) }),
    { ...dynamicFee, firstSwap: 0.0004 }
  ),
  single(
    'slipstream: no volatility part below secondsAgo / 2 observations',
    chain => slipstreamModulePool(chain, { pool: { slot0: () => [1n, 100, 0, 59, 59, true] } }),
    baseOnlyFee
  ),
  single(
    'slipstream: volatility part at exactly secondsAgo / 2 observations',
    chain => slipstreamModulePool(chain, { pool: { slot0: () => [1n, 100, 0, 60, 60, true] } }),
    dynamicFee
  ),
  single(
    'slipstream: no volatility part when observe() reverts',
    chain => slipstreamModulePool(chain, { pool: { observe: () => revert() } }),
    baseOnlyFee
  ),
  single(
    'slipstream: fixed without a scaling factor',
    chain => slipstreamModulePool(chain, { source: configured([400, 10_000, 0n, false, 0]) }),
    { current: 0.0004, dynamic: false }
  ),
  single(
    'slipstream: default scaling factor and cap for a zero scaling factor',
    chain =>
      slipstreamModulePool(chain, {
        source: {
          ...configured([400, 99_999, 0n, false, 0]),
          defaultScalingFactor: () => 5_000_000n,
          defaultFeeCap: () => 3000n,
        },
      }),
    { current: 0.0009, dynamic: true, min: 0.0004, max: 0.003 }
  ),
  single(
    'slipstream: twap truncates towards zero',
    chain =>
      slipstreamModulePool(chain, {
        pool: {
          slot0: () => [1n, 0, 0, 100, 100, true],
          observe: () => [
            [0n, -1210n],
            [0n, 0n],
          ],
        },
      }),
    { current: 0.0005, dynamic: true, min: 0.0004, max: 0.01 }
  ),
  single(
    'slipstream: zero fee indicator base fee is free',
    chain => slipstreamModulePool(chain, { source: configured([420, 10_000, 10_000_000n, false, 0]) }),
    { current: 0, dynamic: false }
  ),
  single(
    'slipstream: without ZERO_FEE_INDICATOR its value is a normal base fee',
    chain =>
      slipstreamModulePool(chain, {
        source: { ...configured([420, 10_000, 10_000_000n, false, 0]), ZERO_FEE_INDICATOR: undefined },
      }),
    { current: 0.00142, dynamic: true, min: 0.00042, max: 0.01 }
  ),
  single(
    'slipstream: fee above 10% falls back to the tick spacing fee',
    chain => slipstreamModulePool(chain, { source: configured([90_000, 200_000, 1_000_000_000n, false, 0]) }),
    { current: 0.0005, dynamic: true, min: 0.09, max: 0.1 }
  ),
  single(
    'slipstream: custom module without dynamicFeeConfig charges pool fee()',
    chain => slipstreamModulePool(chain, { source: { dynamicFeeConfig: undefined } }),
    { current: 0.003, dynamic: false }
  ),
  single(
    'slipstream: custom module skipped when pool fee() reverts',
    chain => slipstreamModulePool(chain, { source: { dynamicFeeConfig: undefined }, pool: { fee: undefined } }),
    undefined
  ),
  single(
    'slipstream: skipped when tickSpacingToFee() reverts',
    chain => slipstreamModulePool(chain, { factory: { tickSpacingToFee: undefined } }),
    undefined
  ),
  single(
    'slipstream: skipped when tickSpacing() reverts',
    chain => slipstreamModulePool(chain, { pool: { tickSpacing: undefined } }),
    undefined
  ),
  single(
    'slipstream: skipped when secondsAgo() reverts',
    chain => slipstreamModulePool(chain, { source: { secondsAgo: undefined } }),
    undefined
  ),
  single(
    'slipstream: skipped when defaultScalingFactor() reverts',
    chain => slipstreamModulePool(chain, { source: { defaultScalingFactor: undefined } }),
    undefined
  ),
  single(
    'slipstream: skipped when slot0() reverts',
    chain => slipstreamModulePool(chain, { pool: { slot0: undefined } }),
    undefined
  ),
];

const aero: Scenario[] = [
  single('aero: base + volatility fee', chain => aeroHookPool(chain), dynamicFee),
  single(
    'aero: observes regardless of cardinality',
    chain => aeroHookPool(chain, { pool: { slot0: () => [1n, 100, 0, 1, 1, true] } }),
    dynamicFee
  ),
  single(
    'aero: twap rounds towards negative infinity',
    chain =>
      aeroHookPool(chain, {
        pool: {
          slot0: () => [1n, 0, 0, 100, 100, true],
          observe: () => [
            [0n, -1210n],
            [0n, 0n],
          ],
        },
      }),
    { current: 0.00051, dynamic: true, min: 0.0004, max: 0.01 }
  ),
  single(
    'aero: zero fee indicator base fee is the tick spacing fee',
    chain => aeroHookPool(chain, { source: configured([420, 10_000, 10_000_000n, false, 0]) }),
    { current: 0.0005, dynamic: false }
  ),
  single(
    'aero: zero fee indicator initial fee is the tick spacing fee',
    chain => aeroHookPool(chain, { source: configured([400, 10_000, 10_000_000n, true, 420]) }),
    { ...dynamicFee, firstSwap: 0.0005 }
  ),
  single(
    'aero: clamped to the 10% ceiling',
    chain => aeroHookPool(chain, { source: configured([90_000, 200_000, 1_000_000_000n, false, 0]) }),
    { current: 0.1, dynamic: true, min: 0.09, max: 0.1 }
  ),
  single('aero: pool fee() for a hook with only a 3 field config', chain => aeroHookPool(chain, { legacySource: {} }), {
    current: 0.003,
    dynamic: true,
  }),
  single(
    'aero: pool fee() for a hook without dynamicFeeConfig',
    chain => aeroHookPool(chain, { source: { dynamicFeeConfig: undefined } }),
    { current: 0.003, dynamic: true }
  ),
  single(
    'aero: skipped for a hook without dynamicFeeConfig when pool fee() reverts',
    chain => aeroHookPool(chain, { source: { dynamicFeeConfig: undefined }, pool: { fee: undefined } }),
    undefined
  ),
  single(
    'aero: CL100 pool 0xc5De…533A on base at block 61396030, where fee() is 1824',
    chain =>
      aeroHookPool(chain, {
        pool: {
          slot0: () => [16066722246015019912261075108175232n, 244410, 569, 900, 900, true],
          observe: () => [
            [713433076740n, 713462405584n],
            [0n, 0n],
          ],
        },
        source: { ...configured([1749, 10_000, 25_000_000n, false, 0]), ZERO_FEE_INDICATOR: () => 16_777_215n },
      }),
    { current: 0.001824, dynamic: true, min: 0.001749, max: 0.01 }
  ),
  single(
    'aero: USDC/TTWOc on base at block 61365137',
    chain =>
      aeroHookPool(chain, {
        pool: { tickSpacing: () => 10, slot0: () => [54704752599642610164516518372n, -7408, 345, 900, 900, true] },
        factory: { tickSpacingToFee: ([tickSpacing]) => (tickSpacing === 10 ? 500 : revert()) },
        source: { ...configured([0, 0, 0n, false, 0]), ZERO_FEE_INDICATOR: () => 16_777_215n },
      }),
    { current: 0.0005, dynamic: false }
  ),
];

const ladder = [
  'velodrome/aero',
  'velodrome/slipstream',
  'algebra/integral',
  'algebra/v1',
  'ramses/v2',
  'ramses/v3',
  'uniswap/v3',
] as const;
type LadderKind = (typeof ladder)[number];

/** a pool with the fee sources of every kind from top down, each charging a different fee */
function ladderPool(chain: FakeChain, top: LadderKind): Address {
  const has = (kind: LadderKind) => ladder.indexOf(kind) >= ladder.indexOf(top);
  const sourceGetters = {
    ZERO_FEE_INDICATOR: () => 420n,
    defaultScalingFactor: () => 0n,
    defaultFeeCap: () => 50_000n,
    secondsAgo: () => 120,
  };
  chain.deploy(HOOK, volatilityFeeSourceAbi, { ...sourceGetters, ...configured([400, 10_000, 0n, false, 0]) });
  chain.deploy(MODULE, volatilityFeeSourceAbi, { ...sourceGetters, ...configured([600, 10_000, 0n, false, 0]) });
  chain.deploy(FACTORY, clFactoryAbi, {
    getPoolSwapHook: has('velodrome/aero') ? ([pool]) => (isPool(pool) ? HOOK : zeroAddress) : undefined,
    swapFeeModule: has('velodrome/slipstream') ? () => MODULE : undefined,
    tickSpacingToFee: () => TICK_SPACING_FEE,
  });
  if (has('ramses/v3')) chain.deploy(FACTORY, ramsesV3FactoryAbi, { accessHub: () => ACCESS_HUB });

  chain.deploy(POOL, clPoolAbi, {
    factory: () => FACTORY,
    fee: () => 1000,
    tickSpacing: () => 100,
    liquidity: () => 1n,
    slot0: () => [1n, 100, 0, 100, 100, true],
  });
  if (has('ramses/v2')) chain.deploy(POOL, ramsesV2PoolAbi, { currentFee: () => 900 });
  if (has('algebra/v1')) {
    chain.deploy(DATA_STORAGE, algebraV1DataStorageAbi, {
      feeConfig: () => algebraV1FeeConfig,
      getFee: (_, from) => (isPool(from) ? 800 : revert()),
    });
    chain.deploy(POOL, algebraV1PoolAbi, {
      dataStorageOperator: () => DATA_STORAGE,
      globalState: () => [1n, 0, 0, 0, 0, 0, true],
    });
  }
  if (has('algebra/integral')) {
    chain.deploy(PLUGIN, algebraIntegralPluginAbi, {});
    chain.deploy(POOL, algebraIntegralPoolAbi, { plugin: () => PLUGIN, globalState: () => [1n, 0, 700, 0, 0, true] });
  }
  return POOL;
}

const ladderFees: Record<LadderKind, ClmSwapFees[string]> = {
  'velodrome/aero': { current: 0.0004, dynamic: false },
  'velodrome/slipstream': { current: 0.0006, dynamic: false },
  'algebra/integral': { current: 0.0007, dynamic: false },
  'algebra/v1': { current: 0.0008, dynamic: true, min: 0.0001, max: 0.015 },
  'ramses/v2': { current: 0.0009, dynamic: true },
  'ramses/v3': { current: 0.001, dynamic: true },
  'uniswap/v3': { current: 0.001, dynamic: false },
};

const priority: Scenario[] = ladder.map(top =>
  single(`priority: ${top} wins over the kinds below it`, chain => ladderPool(chain, top), ladderFees[top])
);

const multipleVaults: Scenario[] = [
  {
    name: 'vaults on different pools',
    setup: chain => [
      vaultFor(chain, aeroHookPool(chain)),
      vaultFor(chain, fixedPool(chain, 500, OTHER_POOL), 'other', OTHER_VAULT),
    ],
    expected: { vault: dynamicFee, other: { current: 0.0005, dynamic: false } },
  },
  {
    name: 'vaults on the same pool',
    setup: chain => [vaultFor(chain, aeroHookPool(chain)), vaultFor(chain, POOL, 'other', OTHER_VAULT)],
    expected: { vault: dynamicFee, other: dynamicFee },
  },
];

const rpcFailures: Scenario[] = [
  {
    name: 'rpc failure on a direct read only drops its vault',
    setup: chain => [
      vaultFor(chain, algebraV1Pool(chain, { dataStorage: { getFee: () => rpcFailure() } })),
      vaultFor(chain, fixedPool(chain, 500, OTHER_POOL), 'other', OTHER_VAULT),
    ],
    expected: { other: { current: 0.0005, dynamic: false } },
  },
  {
    name: 'rpc failure on a batched read only drops the vaults in that batch',
    setup: chain => [
      vaultFor(chain, aeroHookPool(chain, { pool: { observe: () => rpcFailure() } })),
      vaultFor(chain, fixedPool(chain, 500, OTHER_POOL), 'other', OTHER_VAULT),
    ],
    expected: { other: { current: 0.0005, dynamic: false } },
  },
  {
    name: 'a multicall failing as a whole with "execution reverted" drops its vaults rather than misreading them',
    setup: chain => [
      vaultFor(chain, aeroHookPool(chain, { factory: { getPoolSwapHook: () => rpcFailure('execution reverted', 3) } })),
    ],
    expected: {},
  },
];

export const scenarios: Scenario[] = [
  ...poolResolution,
  ...ramses,
  ...algebraIntegral,
  ...algebraV1,
  ...slipstream,
  ...aero,
  ...priority,
  ...multipleVaults,
  ...rpcFailures,
];
