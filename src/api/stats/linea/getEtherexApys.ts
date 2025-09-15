import BigNumber from 'bignumber.js';
import { LINEA_CHAIN_ID as chainId } from '../../../constants';
import { getFarmApys } from '../common/getSolidlyGaugeApys';
import stablePools from '../../../data/linea/etherexStablePools.json';
import volatilePools from '../../../data/linea/etherexVolatilePools.json';
import { getIgnitionAprs } from './getIgnitionAprs';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { BIG_ZERO } from '../../../utils/big-number';
import { getAddress } from 'viem';

const pools = [...stablePools, ...volatilePools];

export async function getEtherexApys() {
  const [vaultAprs, ignitionAprs] = await Promise.all([
    getFarmApys({
      chainId: chainId,
      pools: pools,
      oracleId: 'REX',
      oracle: 'tokens',
      decimals: '1e18',
      reward: '0xEfD81eeC32B9A8222D1842ec3d99c7532C31e348',
      ramses: true,
      rewardScale: 1e18,
      // log: true,
    }) as Promise<BigNumber[]>,
    getIgnitionAprs('Etherex'),
  ]);

  return getApyBreakdown(
    pools.map((pool, i) => ({
      vaultId: pool.name,
      vault: vaultAprs[i] || BIG_ZERO,
      lineaIgnition: ignitionAprs[getAddress(pool.address)] || undefined,
    }))
  );
}
