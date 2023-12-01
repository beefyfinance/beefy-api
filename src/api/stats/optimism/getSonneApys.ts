import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';
import getCompoundV2ApyData from '../common/getCompoundV2Apys';
import { CompoundV2ApyParams, CompoundV2Pool } from '../common/getCompoundV2Apys';

const pools: CompoundV2Pool[] = require('../../../data/optimism/sonnePools.json');
const params: CompoundV2ApyParams = {
  chainId,
  pools,
  comptroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
  compOracleId: 'SONNE',
  secondsPerBlock: 1,
  // log: true,
};

const getSonneApys = async () => {
  return getCompoundV2ApyData(params);
};

module.exports = { getSonneApys };
