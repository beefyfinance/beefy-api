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
  const apys = pools.map(_ => new BigNumber(0));
  try {
    const url = `https://api.merkl.xyz/v3/opportunity?campaigns=true&testTokens=false&chainId=${chainId}`;
    const ops = Object.values(await fetch(url).then(r => r.json())).filter(r => r.status === 'live');

    for (let i = 0; i < pools.length; i++) {
      const p = pools[i];
      const op = ops.find(o =>
        (o.aprBreakdown2 || []).some(v => v.address.toLowerCase() === p.gauge.toLowerCase() && v.value > 0)
      );
      const campaign = (op?.campaigns?.active || []).find(
        c =>
          c.campaignParameters.symbolRewardToken === 'GEMSx' &&
          c.campaignParameters.whitelist.some(a =>
            [p.address.toLowerCase(), p.gauge.toLowerCase()].includes(a.toLowerCase())
          )
      );
      if (campaign) {
        const apr = op.aprBreakdown2.find(a => a.address === campaign.campaignId);
        // console.log(p.name, 'gemsx', apr?.value || 0);
        apys[i] = new BigNumber(apr?.value || 0).div(100);
      }
    }
  } catch (e) {
    console.error('Swapx Gemsx apy error', e.message, e);
  }
  return apys;
}
