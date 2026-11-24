import { parseAbi } from 'viem';
import { fixedFee, managedFee } from '../../fee.ts';
import { contractOf, defineKind, probe } from '../../kind.ts';
import { ALGEBRA_MAX_FEE, type AlgebraSigmoids, algebraFee, type FeeRange, volatilityPart } from './helpers.ts';

const integralPoolAbi = parseAbi([
  'function plugin() view returns (address)',
  'function globalState() view returns (uint160 price, int24 tick, uint16 lastFee, uint8 pluginConfig, uint16 communityFee, bool unlocked)',
]);
const pluginAbi = parseAbi([
  'function getCurrentFee() view returns (uint16)',
  'function feeConfig() view returns (uint16 alpha1, uint16 alpha2, uint32 beta1, uint32 beta2, uint16 gamma1, uint16 gamma2, uint16 baseFee)',
]);

/** Algebra Integral adaptive fee: baseFee + two volatility sigmoids */
export function algebraIntegralRange(config: AlgebraSigmoids): FeeRange {
  return {
    min: config.baseFee + volatilityPart(config, 0),
    max: Math.min(config.baseFee + config.alpha1 + config.alpha2, ALGEBRA_MAX_FEE),
  };
}

/** Integral pools only charge the plugin's fee if both the before-swap hook and dynamic fee flags are on */
const DYNAMIC_FEE_FLAGS = 0x81;

export function isAlgebraIntegralFeeActive(pluginConfig: number): boolean {
  return (pluginConfig & DYNAMIC_FEE_FLAGS) === DYNAMIC_FEE_FLAGS;
}

/** The pool's plugin sets the fee before each swap, if the pool lets it */
export const algebraIntegral = defineKind({
  name: 'algebra/integral',
  probe: pool => ({ plugin: probe({ address: pool.address, abi: integralPoolAbi, functionName: 'plugin' }) }),
  match: (_, results) => {
    const plugin = contractOf(results.plugin);
    return plugin && { plugin };
  },
  fee: async (pool, reader) => {
    const [[, , lastFee, pluginConfig], currentFee, feeConfig] = await Promise.all([
      reader.read({ address: pool.address, abi: integralPoolAbi, functionName: 'globalState' }),
      reader.tryRead({ address: pool.plugin, abi: pluginAbi, functionName: 'getCurrentFee' }),
      reader.tryRead({ address: pool.plugin, abi: pluginAbi, functionName: 'feeConfig' }),
    ]);
    // otherwise swaps keep paying the stored fee
    if (!isAlgebraIntegralFeeActive(pluginConfig)) return fixedFee(lastFee);
    // not the adaptive fee plugin, so its bounds are unknown
    if (!currentFee.ok || !feeConfig.ok) return managedFee(currentFee.ok ? currentFee.value : lastFee);

    const [alpha1, alpha2, beta1, beta2, gamma1, gamma2, baseFee] = feeConfig.value;
    const range = algebraIntegralRange({ alpha1, alpha2, beta1, beta2, gamma1, gamma2, baseFee });
    return algebraFee(currentFee.value, [range]);
  },
});
