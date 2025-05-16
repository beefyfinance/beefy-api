import { getCowApys } from '../common/getCowVaultApys';

export const getBeefyCowSagaApys = async () => {
  return await getCowApys('saga');
};
