import { BASE_CHAIN_ID as chainId } from '../../../constants';
import getCompoundV2ApyData from '../common/getCompoundV2Apys';
import { CompoundV2ApyParams, CompoundV2Pool } from '../common/getCompoundV2Apys';

const pools: CompoundV2Pool[] = require('../../../data/base/sonnePools.json');
const params: CompoundV2ApyParams = {
  chainId,
  pools,
  comptroller: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0',
  compOracleId: 'SONNE',
  secondsPerBlock: 1,
  // log: true,
};

const getSonneApys = async () => {
  return getCompoundV2ApyData(params);
};

module.exports = { getSonneApys };
