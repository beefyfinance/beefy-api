import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';
import getCompoundV3ApyData from '../common/getCompoundV3Apys';
import { CompoundV3ApyParams, CompoundV3Pool } from '../common/getCompoundV3Apys';

const pools: CompoundV3Pool[] = require('../../../data/arbitrum/compoundPools.json');
const params: CompoundV3ApyParams = {
  chainId,
  pools,
  compOracleId: 'COMP',
  secondsPerBlock: 1, // Sonne reports rates per second, not pet block
  //log: true,
};

const getArbCompoundV3Apys = async () => {
  return getCompoundV3ApyData(params);
};

module.exports = { getArbCompoundV3Apys };
