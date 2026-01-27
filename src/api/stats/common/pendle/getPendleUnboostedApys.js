import { getApyBreakdown } from '../getApyBreakdownNew';
import { getPendleApys } from './getPendleBaseApys';

export async function getPendleUnboostedApys(allPools) {
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

function filterExpired(pools) {
  const expired = [];
  const alive = [];
  pools.forEach(pool => {
    const date = pool.name.split('-').pop();
    const timestamp = Date.parse(`${date} UTC`) || 0;
    if (timestamp === 0) console.error(pool.name, 'no expiry date');
    if (timestamp > Date.now()) alive.push(pool);
    else expired.push(pool);
  });
  return [expired, alive];
}
