import BigNumber from 'bignumber.js';
import { getFarmApys } from '../common/getSolidlyGaugeApys';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/berachain/kodiakPools.json';

export const getKodiakApys = async () => {
  const [farmApys, tradingApys] = await Promise.all([
    getFarmApys({
      chainId: chainId,
      pools,
      reward: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
      oracle: 'tokens',
      oracleId: 'iBGT',
      decimals: '1e18',
      infrared: true,
    }),
    getTradingApys(pools),
  ]);
  return getApyBreakdown(
    pools.map((p, i) => ({ vaultId: p.name, vault: farmApys[i], trading: tradingApys[i] }))
  );

  // kodiak gauges
  // getSolidlyGaugeApys({
  //   chainId: chainId,
  //   pools,
  //   oracle: 'tokens',
  //   oracleId: 'WBERA',
  //   decimals: '1e36',
  //   singleReward: true,
  //   log: true,
  // });
};

async function getTradingApys(pools) {
  const vaults = pools.map(p => p.address.toLowerCase());
  const body = {
    query: `{
    kodiakVaults(where: { id_in: ${JSON.stringify(vaults)}}) {
      id
      apr { averageApr }
    }}`,
  };
  let apys = [];
  try {
    const res = await fetch(
      'https://api.goldsky.com/api/public/project_clpx84oel0al201r78jsl0r3i/subgraphs/kodiak-v3-berachain-mainnet/latest/gn',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    ).then(r => r.json());
    apys = vaults.map(id =>
      new BigNumber(res.data.kodiakVaults.find(v => v.id === id)?.apr?.averageApr || 0).div(100)
    );
  } catch (err) {
    console.error('Kodiak subgraph apy error', chainId, err.message);
  }
  return apys;
}
