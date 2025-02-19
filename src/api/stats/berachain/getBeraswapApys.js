import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import beraswapPools from '../../../data/berachain/beraswapPools.json';
import { getRewardPoolApys } from '../common/getRewardPoolApys';

const getBeraswapApys = async () => {
  const data = await getRewardPoolApys({
    chainId: chainId,
    pools: beraswapPools,
    oracle: 'tokens',
    oracleId: 'BGT',
    decimals: '1e36',
    // log: true,
  });

  return data;
};

module.exports = getBeraswapApys;
