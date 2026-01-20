import { MONAD_CHAIN_ID as chainId } from '../../../constants';
import getEulerApyData from '../common/euler/getEulerApys';
import { EulerApyParams, EulerPool } from '../common/euler/getEulerApys';

const pools: EulerPool[] = require('../../../data/monad/eulerPools.json');
const params: EulerApyParams = {
  chainId,
  pools,
  // log: true,
};

export const getEulerApys = async () => {
  return getEulerApyData(params);
};

export default getEulerApys;
