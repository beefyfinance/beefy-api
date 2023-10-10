import getBunniApys from '../common/getBunniApys';
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import { balancerArbClient as client } from '../../../apollo/client';

const pools = require('../../../data/arbitrum/bunniPools.json');

const getBunniArbApys = async () => {
  return getBunniApys({
    chainId: chainId,
    //client: client,
    pools: pools,
    // log: true,
  });
};

module.exports = getBunniArbApys;
