import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { getApyBreakdown } from '../getApyBreakdownNew.ts';
import { getPendleApys, type PendlePool } from './getPendleBaseApys.ts';

const logger = getLoggerFor({ module: 'apy', component: 'pendle-unboosted' });

export async function getPendleUnboostedApys(allPools: PendlePool[]) {
  const chainId = allPools[0].chainId;
  if (!chainId) throw new Error(`Add chainId to first pendle pool: ${allPools[0].name}`);

  const [expiredPools, pools] = filterExpired(allPools);
  const { tradingApys, pendleApys, syRewardsApys } = await getPendleApys(chainId, pools);

  return getApyBreakdown([
    ...expiredPools.map(p => ({ vaultId: p.name, vault: 0 })),
    ...pools.map((p, i) => ({
      vaultId: p.name,
      vault: pendleApys[i].plus(syRewardsApys[i]),
      trading: tradingApys[p.address.toLowerCase()],
    })),
  ]);
}

function filterExpired(pools: PendlePool[]) {
  const expired: PendlePool[] = [];
  const alive: PendlePool[] = [];
  pools.forEach(pool => {
    const date = pool.name.split('-').pop();
    const timestamp = Date.parse(`${date} UTC`) || 0;
    if (timestamp === 0) logger.warn({ vault: pool.name }, 'no expiry date');
    if (timestamp > Date.now()) alive.push(pool);
    else expired.push(pool);
  });
  return [expired, alive];
}
