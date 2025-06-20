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
    const url = `https://api.merkl.xyz/v4/campaigns?chainId=${chainId}&tokenSymbol=GEMSx&status=LIVE&items=100`;

    const [campaigns, supplies] = await Promise.all([
      fetch(url).then(r => r.json()),
      Promise.all(pools.map(p => fetchContract(p.gauge, ERC20Abi, chainId).read.totalSupply())),
    ]);

    for (let i = 0; i < pools.length; i++) {
      const p = pools[i];
      const campaign = campaigns.find(c =>
        c.params.whitelist.some(a => a.toLowerCase() === p.gauge.toLowerCase())
      );
      if (campaign) {
        const period = campaign.endTimestamp - campaign.startTimestamp;
        const rewardRate = new BigNumber(campaign.amount).div(period);
        const price = await fetchPrice({ oracle: 'tokens', id: 'GEMSx' });
        const rewards = rewardRate.times(31536000).times(price).div('1e18');

        const lpPrice = await fetchPrice({ oracle: 'lps', id: p.name });
        const totalStakedInUsd = new BigNumber(supplies[i]).div('1e18').times(lpPrice);

        apys[i] = rewards.div(totalStakedInUsd);
        // console.log(p.name, 'gemsx', apys[i].toNumber());
      }
    }
  } catch (e) {
    console.error('Swapx Gemsx apy error', e.message, e);
  }
  return apys;
}
