import { ETH_CHAIN_ID } from '../../../constants';
import { getCurveSubgraphApys } from '../common/curve/getCurveApyData';
import ERC20Abi from '../../../abis/ERC20Abi';
import { fetchContract } from '../../rpc/client';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../../utils/fetchPrice';

const pools = [
  ...require('../../../data/ethereum/usualCurvePools.json'),
  {
    name: 'usual-eth0',
    pool: '0x734eec7930bc84eC5732022B9EB949A81fB89AbE',
    user: '0x5A10dE7BC57f4f6fcDad5D26036C02B25e69e3a8',
    oracle: 'tokens',
    oracleId: 'ETH0',
  },
];
const subgraphUrl = 'https://api.curve.finance/api/getSubgraphData/ethereum';

// new usd0-usd0++ user 0xb0c7c46E2eEcb1Ac1c4203bDeA48B6F8CA2442a1
// new usd0-usdc user  0xB4b98D7B8ef5D0f40d9Cd7E9dbf0228B0bCaB622

export const getUsualApys = async () => {
  const [baseApys, farmApys] = await Promise.all([
    getCurveSubgraphApys(pools, subgraphUrl),
    getPoolApys(pools),
  ]);
  return getApyBreakdown(
    pools.map((p, i) => ({ vaultId: p.name, vault: farmApys[i], trading: baseApys[p.name] }))
  );
};

const getPoolApys = async pools => {
  const apys = [];

  const [balances, rewards] = await Promise.all([
    Promise.all(pools.map(p => fetchContract(p.pool, ERC20Abi, ETH_CHAIN_ID).read.balanceOf([p.user]))),
    Promise.all(
      pools.map(p => fetch(`https://app.usual.money/api/rewards/${p.user}`).then(res => res.json()))
    ),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: pool.oracle || 'lps', id: pool.oracleId || pool.name });
    const totalStakedInUsd = new BigNumber(balances[i]).div('1e18').times(lpPrice);

    const r = rewards[i];
    let dailyRewards = new BigNumber(0);
    if (r.length === 1) dailyRewards = new BigNumber(r[0].value);
    else if (r.length > 1) {
      dailyRewards = new BigNumber(r[r.length - 1].value).minus(new BigNumber(r[r.length - 2].value));
    }
    const usualPrice = await fetchPrice({ oracle: 'tokens', id: 'USUAL' });
    const yearlyRewardsInUsd = dailyRewards.div('1e18').times(usualPrice).times(365);
    const apy = yearlyRewardsInUsd.div(totalStakedInUsd);
    apys.push(apy);
    // console.log(pool.name, apy.toNumber(), totalStakedInUsd.toNumber(), dailyRewards.div('1e18').toNumber());
  }

  return apys;
};
