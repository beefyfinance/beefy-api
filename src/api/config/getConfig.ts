import { addressBook } from '@beefyfinance/blockchain-addressbook';
import type { BeefyFinance } from '@beefyfinance/blockchain-addressbook/types/beefyfinance';
import { omitBy } from 'lodash-es';
import { ZERO_ADDRESS } from '../../utils/address.ts';
import { getLoggerFor } from '../../utils/logger/index.ts';
import { typedKeys } from '../../utils/object.ts';

const logger = getLoggerFor({ module: 'config' });

const configsByChain: Record<string, Partial<BeefyFinance>> = {};

export const initConfigService = () => {
  typedKeys(addressBook).forEach(chain => {
    const config = addressBook[chain].platforms.beefyfinance;
    // Prune ab fields
    configsByChain[chain] = omitBy(config, value => value === undefined || value === null || value === ZERO_ADDRESS);
  });

  logger.info('configs initialized');
};

export const getAllConfigs = () => {
  return configsByChain;
};

export const getSingleChainConfig = (chain: string) => {
  return configsByChain[chain] ?? {};
};
