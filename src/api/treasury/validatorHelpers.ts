import { TreasuryApiResult, ValidatorAsset } from './types';
import { ApiChain } from '../../utils/chain';
import { fetchContract } from '../rpc/client';
import { ChainId } from '../../../packages/address-book/src/address-book';
import BigNumber from 'bignumber.js';

const validatorsByChain: Partial<Record<ApiChain, ValidatorAsset[]>> = {
  ethereum: [
    {
      id: 'eth-validator-1',
      numberId: 402418,
      name: 'Ethereum Validator',
      address: 'native',
      oracleId: 'ETH',
      oracleType: 'tokens',
      decimals: 18,
      symbol: 'ETH',
      method: 'api',
      methodPath: 'https://beaconcha.in/api/v1/validator/402418',
      assetType: 'validator',
    },
  ],
  sonic: [
    {
      id: 'sonic-validator',
      numberId: 31,
      name: 'SONIC Validator',
      address: 'native',
      oracleId: 'WS',
      oracleType: 'tokens',
      decimals: 18,
      symbol: 'S',
      method: 'sonic-contract',
      methodPath: '0x10E13f11419165beB0F456eC8a230899E4013BBD',
      assetType: 'validator',
      helper: '0xFC00FACE00000000000000000000000000000000',
    },
  ],
};

export const hasChainValidator = (chain: ApiChain): boolean => !!validatorsByChain[chain];

export const getChainValidators = (chain: ApiChain): ValidatorAsset[] => validatorsByChain[chain];

type SonicValidator = Omit<Required<ValidatorAsset>, 'method'> & { method: 'sonic-contract' };

export function isSonicValidator(asset: ValidatorAsset): asset is SonicValidator {
  return asset.method === 'sonic-contract';
}

const sonicValidatorContractAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'validatorID', type: 'uint256' }],
    name: 'getSelfStake',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'delegator', type: 'address' },
      { internalType: 'uint256', name: 'toValidatorID', type: 'uint256' },
    ],
    name: 'pendingRewards',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const fetchSonicValidatorBalance = async (asset: SonicValidator, chainId: number): Promise<bigint> => {
  const contract = fetchContract(asset.helper, sonicValidatorContractAbi, chainId);
  const [selfStaked, pending] = await Promise.all([
    contract.read.getSelfStake([BigInt(asset.numberId)]),
    contract.read.pendingRewards([asset.methodPath as `0x${string}`, BigInt(asset.numberId)]),
  ]);

  return selfStaked + pending;
};

export const fetchAPIValidatorBalance = async (apiAsset: ValidatorAsset): Promise<TreasuryApiResult> => {
  let balance: number = await fetch(apiAsset.methodPath)
    .then(res => res.json())
    .then((res: any) => ((res.data?.length ?? 0) > 0 ? res.data[0].balance : res.data.balance));
  return {
    apiAsset,
    balance: new BigNumber(balance).shiftedBy(9),
  };
};

export const getValidatorBalanceCall = (asset: ValidatorAsset, chainId: ChainId) => {
  if (isSonicValidator(asset)) {
    return [fetchSonicValidatorBalance(asset, chainId)];
  } else {
    return [fetchAPIValidatorBalance(asset)];
  }
};
