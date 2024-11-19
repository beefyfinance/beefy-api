import BigNumber from 'bignumber.js';
import getApyBreakdown from '../common/getApyBreakdown';
import { getFarmApys } from '../common/getRewardPoolApys';
import { BASE_CHAIN_ID } from '../../../constants';
import pools from '../../../data/base/tokemakPools.json';

const url = 'https://yields.llama.fi/chart/';

const params = {
  pools,
  oracle: 'tokens',
  oracleId: 'TOKE',
  decimals: '1e18',
  chainId: BASE_CHAIN_ID,
  periodFinish: 'periodInBlockFinish',
};

export const getTokemakApys = async () => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(), getFarmApys(params)]);

  return getApyBreakdown(pools, tradingAprs, farmApys, 0);
};

const getTradingAprs = async () => {
  const tradingAprs = {};

  const fetchPool = async pool => {
    try {
      const response = await fetch(url + pool.poolId);

      const { data } = await response.json();

      let apy = new BigNumber(0);

      const length = data.length;
      apy = new BigNumber(data[length - 1].apyBase / 100);

      return [pool.address.toLowerCase(), apy];
    } catch (e) {
      console.log('Tokemak url fetch error for pool', pool.address, e);
      return null;
    }
  };

  const results = await Promise.all(pools.map(fetchPool));

  results.forEach(result => {
    if (result) {
      const [address, apy] = result;
      tradingAprs[address] = apy;
    }
  });

  return tradingAprs;
};
