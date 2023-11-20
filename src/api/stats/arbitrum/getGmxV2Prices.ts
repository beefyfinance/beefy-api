import { getGmxV2Prices } from '../common/gmx/getGmxV2Prices';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import pools from '../../../data/arbitrum/gmxV2Pools.json';

const reader = '0xf60becbba223EEA9495Da3f606753867eC10d139';
const dataStore = '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8';
const url = 'https://arbitrum-api.gmxinfra.io/prices/tickers';

export const getGmxV2ArbitrumPrices = async () => {
  return await getGmxV2Prices(chainId, reader, dataStore, url, pools);
};
