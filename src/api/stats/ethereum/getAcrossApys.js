import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { fetchPrice } from '../../../utils/fetchPrice';
import { ETH_CHAIN_ID } from '../../../constants';
import AcceleratingDistributor from '../../../abis/ethereum/AcceleratingDistributor';
import pools from '../../../data/ethereum/acrossPools.json';

const Distributor = '0x9040e41eF5E8b281535a96D9a48aCb8cfaBD9a48';
const url = 'https://across.to/api/pools?token=';

export const getAcrossApys = async () => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(), getFarmApys()]);

  return getApyBreakdown(pools, tradingAprs, farmApys, 0.0006);
};

const getTradingAprs = async () => {
  const tradingAprs = {};
  for (let i = 0; i < pools.length; ++i) {
    const pool = pools[i];
    try {
      const response = await fetch(url + pool.underlying.address).then(res => res.json());
      tradingAprs[pool.address.toLowerCase()] = new BigNumber(response.estimatedApy);
    } catch (e) {
      console.log('Across url fetch error', e);
    }
  }

  return tradingAprs;
};

const getFarmApys = async () => {
  const stakingTokenCalls = [];
  const distributor = fetchContract(Distributor, AcceleratingDistributor, ETH_CHAIN_ID);
  pools.forEach(pool => {
    stakingTokenCalls.push(distributor.read.stakingTokens([pool.address]));
  });
  const [res] = await Promise.all([Promise.all(stakingTokenCalls)]);
  const emissions = res.map(v => new BigNumber(v['1']));
  const staked = res.map(v => new BigNumber(v['4']));

  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: 'ACX' });
  const farmApys = [];

  for (let i = 0; i < pools.length; ++i) {
    const pool = pools[i];
    const price = await fetchPrice({ oracle: 'tokens', id: pool.underlying.symbol });
    const totalStakedInUsd = staked[i].times(price).dividedBy(pool.decimals);
    const apr = emissions[i]
      .times(rewardPrice)
      .dividedBy(1e18)
      .times(31536000)
      .dividedBy(totalStakedInUsd);
    farmApys.push(apr);
  }

  return farmApys;
};
