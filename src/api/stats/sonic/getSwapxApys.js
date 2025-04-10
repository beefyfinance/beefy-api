import BigNumber from 'bignumber.js';
import { getFarmApys } from '../common/getSolidlyGaugeApys';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import { fetchPrice } from '../../../utils/fetchPrice';

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
    const url = `https://api.merkl.xyz/v3/opportunity?campaigns=false&testTokens=false&chainId=${chainId}`;
    const campaigns = Object.values(await fetch(url).then(r => r.json())).filter(r => r.status === 'live');

    const supplies = await Promise.all(
      pools.map(p => fetchContract(p.gauge, ERC20Abi, chainId).read.totalSupply())
    );

    for (let i = 0; i < pools.length; i++) {
      const p = pools[i];
      const campaign = campaigns.find(c =>
        Object.values(c.aprBreakdown || {}).some(v => v.address.toLowerCase() === p.gauge.toLowerCase())
      );
      if (campaign) {
        // rewards are for both gauges so div(2)
        const rewards = new BigNumber(campaign.dailyrewards || 0).div(2).times(365);
        const lpPrice = await fetchPrice({ oracle: 'lps', id: p.name });
        const totalStakedInUsd = new BigNumber(supplies[i]).div('1e18').times(lpPrice);
        apys[i] = rewards.div(totalStakedInUsd);
      }
    }
  } catch (e) {
    console.error('Swapx Gemsx apy error', e.message, e);
  }
  return apys;
}
