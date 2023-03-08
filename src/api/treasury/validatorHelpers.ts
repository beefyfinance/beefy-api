import { ValidatorAsset } from './types';
import { ApiChain } from '../../utils/chain';

const validatorsByChain: Partial<Record<ApiChain, ValidatorAsset>> = {
  fantom: {
    name: 'Fantom Validator',
    address: 'validator',
    oracleId: 'FTM',
    oracleType: 'tokens',
    decimals: 18,
    method: 'contract',
    methodPath: '0xDf87E4dBb0336d3571b2f8000b1f5353Dfb638c1',
    assetType: 'validator',
  },
  ethereum: {
    name: 'Ethereum Validator',
    address: 'validator',
    oracleId: 'ETH',
    oracleType: 'tokens',
    decimals: 18,
    method: 'api',
    methodPath: 'https://beaconcha.in/api/v1/validator/402418',
    assetType: 'validator',
  },
  fuse: {
    name: 'Fuse Validator',
    address: 'validator',
    oracleId: 'FUSE',
    oracleType: 'tokens',
    decimals: 18,
    method: 'contract',
    methodPath: '0xa852A119a29d44e13A4B939B482D522808437BAe',
    assetType: 'validator',
  },
};

export const hasChainValidator = (chain: ApiChain): boolean => !!validatorsByChain[chain];

export const getChainValidator = (chain: ApiChain): ValidatorAsset => validatorsByChain[chain];
