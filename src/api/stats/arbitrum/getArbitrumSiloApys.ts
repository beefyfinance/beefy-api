import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/arbitrum/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  // log: true,
};

const getArbSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getArbSiloApys };
