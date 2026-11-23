import { parseAbi } from 'viem';

export const vaultAbi = parseAbi(['function want() view returns (address)']);

export const clPoolAbi = parseAbi([
  'function factory() view returns (address)',
  'function fee() view returns (uint24)',
  'function tickSpacing() view returns (int24)',
  'function liquidity() view returns (uint128)',
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, bool unlocked)',
  'function observe(uint32[] secondsAgos) view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)',
]);

export const clFactoryAbi = parseAbi([
  'function getPoolSwapHook(address pool) view returns (address)',
  'function swapFeeModule() view returns (address)',
  'function tickSpacingToFee(int24 tickSpacing) view returns (uint24)',
]);

export const volatilityFeeSourceAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor, bool initialFeeEnabled, uint24 initialFee)',
  'function ZERO_FEE_INDICATOR() view returns (uint256)',
  'function defaultScalingFactor() view returns (uint256)',
  'function defaultFeeCap() view returns (uint256)',
  'function secondsAgo() view returns (uint32)',
]);

export const legacyFeeModuleAbi = parseAbi([
  'function dynamicFeeConfig(address pool) view returns (uint24 baseFee, uint24 feeCap, uint64 scalingFactor)',
  'function ZERO_FEE_INDICATOR() view returns (uint256)',
  'function defaultScalingFactor() view returns (uint256)',
  'function defaultFeeCap() view returns (uint256)',
  'function secondsAgo() view returns (uint32)',
]);

export const ramsesV2PoolAbi = parseAbi([
  'function factory() view returns (address)',
  'function fee() view returns (uint24)',
  'function currentFee() view returns (uint24)',
]);

export const ramsesV3FactoryAbi = parseAbi(['function accessHub() view returns (address)']);

export const algebraIntegralPoolAbi = parseAbi([
  'function factory() view returns (address)',
  'function tickSpacing() view returns (int24)',
  'function plugin() view returns (address)',
  'function globalState() view returns (uint160 price, int24 tick, uint16 lastFee, uint8 pluginConfig, uint16 communityFee, bool unlocked)',
]);

export const algebraIntegralPluginAbi = parseAbi([
  'function getCurrentFee() view returns (uint16)',
  'function feeConfig() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint16 baseFee)',
]);

export const algebraV1PoolAbi = parseAbi([
  'function factory() view returns (address)',
  'function tickSpacing() view returns (int24)',
  'function dataStorageOperator() view returns (address)',
  'function liquidity() view returns (uint128)',
  'function globalState() view returns (uint160 price, int24 tick, uint16 fee, uint16 timepointIndex, uint16 communityFeeToken0, uint16 communityFeeToken1, bool unlocked)',
]);

export const camelotPoolAbi = parseAbi([
  'function factory() view returns (address)',
  'function tickSpacing() view returns (int24)',
  'function dataStorageOperator() view returns (address)',
  'function liquidity() view returns (uint128)',
  'function globalState() view returns (uint160 price, int24 tick, uint16 feeZto, uint16 feeOtz, uint16 timepointIndex, uint8 communityFeeToken0, uint8 communityFeeToken1, bool unlocked)',
]);

const algebraV1FeeConfig =
  '(uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)';

export const algebraV1DataStorageAbi = parseAbi([
  `function feeConfig() view returns ${algebraV1FeeConfig}`,
  'function getFee(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 fee)',
]);

export const camelotDataStorageAbi = parseAbi([
  `function feeConfigZto() view returns ${algebraV1FeeConfig}`,
  `function feeConfigOtz() view returns ${algebraV1FeeConfig}`,
  'function getFees(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 feeZto, uint16 feeOtz)',
]);
