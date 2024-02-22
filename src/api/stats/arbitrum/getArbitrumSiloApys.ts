import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import getSiloApyData from '../common/getSiloApys';
import { SiloApyParams, SiloPool } from '../common/getSiloApys';

const pools: SiloPool[] = require('../../../data/arbitrum/siloPools.json');
const params: SiloApyParams = {
  chainId,
  pools,
  lens: '0xBDb843c7a7e48Dc543424474d7Aa63b61B5D9536',
  // log: true,
};

const getArbSiloApys = async () => {
  return getSiloApyData(params);
};

module.exports = { getArbSiloApys };
