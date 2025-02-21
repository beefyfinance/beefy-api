import { BERACHAIN_CHAIN_ID as chainId } from '../../../constants';
import beraswapPools from '../../../data/berachain/beraswapPools.json';
import { getSolidlyGaugeApys } from '../common/getSolidlyGaugeApys';

const getBeraswapApys = async () => {
  const data = await getSolidlyGaugeApys({
    chainId: chainId,
    pools: beraswapPools,
    reward: '0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b',
    oracle: 'tokens',
    oracleId: 'iBGT',
    decimals: '1e18',
    infrared: true,
    //log: true,
  });

  return data;
};

module.exports = getBeraswapApys;
