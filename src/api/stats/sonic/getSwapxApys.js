import BigNumber from 'bignumber.js';
import { getFarmApys } from '../common/getSolidlyGaugeApys';
import { getApyBreakdown } from '../common/getApyBreakdownNew';

const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const stablePools = require('../../../data/sonic/swapxStableLpPools.json');
const ichiPools = require('../../../data/sonic/swapxIchiPools.json');

const pools = [...stablePools, ...ichiPools];

export const getSwapxApys = async () => {
  const [farmApys, gemsxApys] = await Promise.all([
    getFarmApys({
      chainId: chainId,
      pools: pools,
      oracleId: 'SWPx',
      oracle: 'tokens',
      decimals: '1e18',
      boosted: false,
      singleReward: true,
      // log: true,
    }),
    getGemsxApy(pools),
  ]);
  return getApyBreakdown(pools.map((p, i) => ({ vaultId: p.name, vault: farmApys[i].plus(gemsxApys[i]) })));
};

async function getGemsxApy(pools) {
  const apys = [];
  try {
    const url = `https://api.merkl.xyz/v3/opportunity?campaigns=false&testTokens=false&chainId=${chainId}`;
    const res = Object.values(await fetch(url).then(r => r.json())).filter(
      r => r.status === 'live' && r.tags.includes('SwapXGemsX')
    );
    pools.forEach(p => {
      const targets = [p.address.toLowerCase(), p.gauge.toLowerCase()];
      const campaign = res.find(r =>
        Object.values(r.aprBreakdown).some(v => targets.includes(v.address.toLowerCase()))
      );
      // if (campaign) console.log(p.name, campaign?.apr)
      apys.push(new BigNumber(campaign?.apr || 0).div(100));
    });
  } catch (err) {
    console.error('Swapx Gemsx apy error', err.message);
  }
  return apys;
}
