import { ValidatorAsset } from './types';

const validatorsByChain: Record<string, ValidatorAsset> = {
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
  // ethereum: {
  //   name: 'Ethereum Validator',
  //   address: 'validator',
  //   oracleId: 'ETH',
  //   oracleType: 'tokens',
  //   decimals: 18,
  //   method: 'api',
  //   methodPath: 'https://beaconcha.in/api/v1/validator/0x898e68fac00283d535520763ba9646b15ffb26d25df6c53f51854aa6d620ca8dd0a7b000b25b3141c1d4c1eb6d07710c/balancehistory',
  //   assetType: 'validator'
  // },
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

export const hasChainValidator = (chain: string): boolean => !!validatorsByChain[chain];

export const getChainValidator = (chain: string): ValidatorAsset => validatorsByChain[chain];
