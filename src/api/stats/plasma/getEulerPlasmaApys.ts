import { PLASMA_CHAIN_ID as chainId } from '../../../constants';
import getEulerApyData from '../common/euler/getEulerApys';
import { EulerApyParams, EulerPool } from '../common/euler/getEulerApys';

const pools: EulerPool[] = require('../../../data/plasma/eulerPools.json');
const params: EulerApyParams = {
  chainId,
  pools,
  // log: true,
};

const getEulerPlasmaApys = async () => {
  return getEulerApyData(params);
};

module.exports = { getEulerPlasmaApys };
