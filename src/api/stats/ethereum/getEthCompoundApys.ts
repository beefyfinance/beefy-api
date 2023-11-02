import { ETH_CHAIN_ID as chainId } from '../../../constants';
import getCompoundV3ApyData from '../common/getCompoundV3Apys';
import { CompoundV3ApyParams, CompoundV3Pool } from '../common/getCompoundV3Apys';

const pools: CompoundV3Pool[] = require('../../../data/ethereum/compoundPools.json');
const params: CompoundV3ApyParams = {
  chainId,
  pools,
  compOracleId: 'COMP',
  secondsPerBlock: 1, //  rates per second, not pet block
  //log: true,
};

const getETHCompoundV3Apys = async () => {
  return getCompoundV3ApyData(params);
};

module.exports = { getETHCompoundV3Apys };
