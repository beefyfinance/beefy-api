import { getCowApys } from '../common/getCowVaultApys.ts';

export const getBeefyGnosisCowApys = async () => {
  return await getCowApys('gnosis');
};
