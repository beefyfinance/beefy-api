import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import getApyBreakdown from '../common/getApyBreakdown';
import { getFarmApys } from '../common/getRewardPoolApys';
import { fetchPrice } from '../../../utils/fetchPrice';
import { ETH_CHAIN_ID } from '../../../constants';
import pools from '../../../data/ethereum/tokemakPools.json';
import { timeStamp } from 'console';

const url = 'https://subgraph.satsuma-prod.com/ba2506a7b20f/tokemak/v2-gen3-eth-mainnet/api';
const query = `query GetAutopoolDayData($address:String!$timestamp:BigInt!){
      autopoolDayDatas(
        where:{id_contains_nocase:$address timestamp_gte:$timestamp}
        orderBy:timestamp 
        orderDirection:asc 
        first:1000
      ){
        totalSupply nav date timestamp id autopoolApy autopoolDay7MAApy 
        autopoolDay30MAApy rewarderApy rewarderDay7MAApy rewarderDay30MAApy 
        vault{id registered}
      }
    }`;

const params = {
  pools,
  oracle: 'tokens',
  oracleId: 'TOKE',
  decimals: '1e18',
  chainId: ETH_CHAIN_ID,
  periodFinish: 'periodInBlockFinish',
};

export const getTokemakApys = async () => {
  const [tradingAprs, farmApys] = await Promise.all([getTradingAprs(), getFarmApys(params)]);

  return getApyBreakdown(pools, tradingAprs, farmApys, 0);
};

const getTradingAprs = async () => {
  const tradingAprs = {};
  const date = (Date.now() / 1000).toFixed() - 30 * 86400;

  const fetchPool = async pool => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { address: pool.address.toLowerCase(), timestamp: date },
          extensions: {
            connectionParams: {},
            endpoint: 'https://subgraph.satsuma-prod.com/ba2506a7b20f/tokemak/v2-gen3-eth-mainnet/api',
          },
        }),
      });

      const { data } = await response.json();

      let apy = new BigNumber(0);

      data.autopoolDayDatas.forEach(data => (apy = apy.plus(new BigNumber(data.autopoolApy))));

      apy = apy.dividedBy(new BigNumber(data.autopoolDayDatas.length)).dividedBy(1e18);

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
