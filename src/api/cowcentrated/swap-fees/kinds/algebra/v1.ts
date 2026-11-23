import { parseAbi } from 'viem';
import { contractOf, defineKind, FeeUnavailableError, probe } from '../../kind.ts';
import {
  ALGEBRA_MAX_FEE,
  type AlgebraSigmoids,
  algebraFee,
  type FeeRange,
  sigmoid,
  volatilityPart,
} from './helpers.ts';

const v1PoolAbi = parseAbi([
  'function dataStorageOperator() view returns (address)',
  'function liquidity() view returns (uint128)',
  'function globalState() view returns (uint160 price, int24 tick, uint16 fee, uint16 timepointIndex, uint16 communityFeeToken0, uint16 communityFeeToken1, bool unlocked)',
]);
const directionalPoolAbi = parseAbi([
  'function globalState() view returns (uint160 price, int24 tick, uint16 feeZto, uint16 feeOtz, uint16 timepointIndex, uint8 communityFeeToken0, uint8 communityFeeToken1, bool unlocked)',
]);
const feeConfig =
  '(uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint32 volumeBeta, uint16 volumeGamma, uint16 baseFee)';
const dataStorageAbi = parseAbi([
  `function feeConfig() view returns ${feeConfig}`,
  `function feeConfigZto() view returns ${feeConfig}`,
  `function feeConfigOtz() view returns ${feeConfig}`,
  'function getFee(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 fee)',
  'function getFees(uint32 time, int24 tick, uint16 index, uint128 liquidity) view returns (uint16 feeZto, uint16 feeOtz)',
]);

export type AlgebraV1FeeConfig = AlgebraSigmoids & {
  volumeBeta: number;
  volumeGamma: number;
};

/** Algebra v1 adaptive fee: baseFee + sigmoid(volume, volumeGamma, volatility sigmoids, volumeBeta) */
export function algebraV1Range(config: AlgebraV1FeeConfig): FeeRange {
  const volatilityAtZero = volatilityPart(config, 0);
  return {
    min: config.baseFee + sigmoid(0, config.volumeGamma, volatilityAtZero, config.volumeBeta),
    max: Math.min(config.baseFee + Math.min(config.alpha1 + config.alpha2, ALGEBRA_MAX_FEE), ALGEBRA_MAX_FEE),
  };
}

type RawFeeConfig = readonly [number, number, number, number, number, number, number, number, number];

function feeRange([alpha1, alpha2, beta1, beta2, gamma1, gamma2, volumeBeta, volumeGamma, baseFee]: RawFeeConfig) {
  const config: AlgebraV1FeeConfig = { alpha1, alpha2, beta1, beta2, gamma1, gamma2, volumeBeta, volumeGamma, baseFee };
  return algebraV1Range(config);
}

/**
 * Algebra v1 (camelot directional, thena): the fee in globalState is from the last swap, so ask the data storage
 * operator what a swap would pay now. That leaves out volume swapped since the last timepoint, so can be a few pips off.
 */
export const algebraV1 = defineKind({
  name: 'algebra/v1',
  probe: pool => ({
    dataStorageOperator: probe({ address: pool.address, abi: v1PoolAbi, functionName: 'dataStorageOperator' }),
  }),
  match: (_, results) => {
    const dataStorageOperator = contractOf(results.dataStorageOperator);
    return dataStorageOperator && { dataStorageOperator };
  },
  fee: async (pool, reader) => {
    const dataStorage = { address: pool.dataStorageOperator, abi: dataStorageAbi } as const;
    const [config, configZto, configOtz, liquidity] = await Promise.all([
      reader.tryRead({ ...dataStorage, functionName: 'feeConfig' }),
      reader.tryRead({ ...dataStorage, functionName: 'feeConfigZto' }),
      reader.tryRead({ ...dataStorage, functionName: 'feeConfigOtz' }),
      reader.read({ address: pool.address, abi: v1PoolAbi, functionName: 'liquidity' }),
    ]);
    const time = Number(reader.block.timestamp);

    // getFee(s) only answers the pool, so it is read as the pool
    if (configZto.ok && configOtz.ok) {
      const [, tick, , , timepointIndex] = await reader.read({
        address: pool.address,
        abi: directionalPoolAbi,
        functionName: 'globalState',
      });
      const fees = await reader.read({
        ...dataStorage,
        functionName: 'getFees',
        args: [time, tick, timepointIndex, liquidity],
        account: pool.address,
      });
      // swaps pay a fee per direction, show the higher like the strategy does
      return algebraFee(Math.max(...fees), [feeRange(configZto.value), feeRange(configOtz.value)]);
    }

    if (!config.ok) throw new FeeUnavailableError('data storage operator has no fee config');
    const [, tick, , timepointIndex] = await reader.read({
      address: pool.address,
      abi: v1PoolAbi,
      functionName: 'globalState',
    });
    const fee = await reader.read({
      ...dataStorage,
      functionName: 'getFee',
      args: [time, tick, timepointIndex, liquidity],
      account: pool.address,
    });
    return algebraFee(fee, [feeRange(config.value)]);
  },
});
