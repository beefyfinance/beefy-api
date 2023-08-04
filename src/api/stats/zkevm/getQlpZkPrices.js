import { getGmxPrices } from '../common/gmx/getGmxPrices';
import { ZKEVM_CHAIN_ID as chainId } from '../../../constants';
import qlpPools from '../../../data/zkevm/qlpPools.json';

export const getQlpZkPrices = async tokenPrices => {
  return await getGmxPrices(chainId, qlpPools, tokenPrices);
};
