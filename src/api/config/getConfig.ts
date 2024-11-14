import { addressBook } from '../../../packages/address-book/src/address-book';
import { omitBy } from 'lodash';
import { ZERO_ADDRESS } from '../../utils/address';
import { BeefyFinance } from '../../../packages/address-book/src/types/beefyfinance';

const configsByChain: Record<string, BeefyFinance> = {};

export const initConfigService = () => {
  Object.keys(addressBook).forEach(chain => {
    const config = addressBook[chain].platforms.beefyfinance;
    // Prune ab fields
    configsByChain[chain] = omitBy(
      config,
      value => value === undefined || value === null || value === ZERO_ADDRESS
    );
  });

  console.log('> Configs initialized');
};

export const getAllConfigs = () => {
  return configsByChain;
};

export const getSingleChainConfig = (chain: string) => {
  return configsByChain[chain] ?? {};
};
