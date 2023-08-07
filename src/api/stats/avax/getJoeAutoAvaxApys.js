import { AVAX_CHAIN_ID as chainId } from '../../../constants';
import { getJoeAutoApys } from '../common/joe/getJoeAutoApys';
import pools from '../../../data/avax/joeAutoPools.json';

export const getJoeAutoAvaxApys = () => {
  return getJoeAutoApys({
    masterchef: '0x57FF9d1a7cf23fD1A9fd9DC07823F950a22a718C',
    pools,
    oracle: 'tokens',
    oracleId: 'JOE',
    decimals: '1e18',
    chainId: chainId,
    // log: true,
  });
};
