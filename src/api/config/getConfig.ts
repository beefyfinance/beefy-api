import { addressBook } from '../../../packages/address-book/address-book';

const configsByChain: Record<string, Config> = {};

interface Config {
  devMultisig: string;
  treasuryMultisig: string;
  strategyOwner: string;
  vaultOwner: string;
  keeper: string;
  treasurer: string;
  launchpoolOwner: string;
  rewardPool: string;
  treasury: string;
  beefyFeeRecipient: string;
  bifiMaxiStrategy: string;
  voter: string;
  beefyFeeConfig: string;
}

export const initConfigService = () => {
  Object.keys(addressBook).forEach(chain => {
    const config = addressBook[chain].platforms.beefyfinance;
    // Prune ab fields
    configsByChain[chain] = {
      devMultisig: config.devMultisig,
      treasuryMultisig: config.treasuryMultisig,
      strategyOwner: config.strategyOwner,
      vaultOwner: config.vaultOwner,
      keeper: config.keeper,
      treasurer: config.treasurer,
      launchpoolOwner: config.launchpoolOwner,
      rewardPool: config.rewardPool,
      treasury: config.treasury,
      beefyFeeRecipient: config.beefyFeeRecipient,
      bifiMaxiStrategy: config.bifiMaxiStrategy,
      voter: config.voter,
      beefyFeeConfig: config.beefyFeeConfig,
    };
  });

  console.log('> Configs initialized');
};

export const getAllConfigs = () => {
  return configsByChain;
};

export const getSingleChainConfig = (chain: string) => {
  return configsByChain[chain] ?? {};
};
