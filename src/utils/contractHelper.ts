import { AbiItem, StateMutabilityType, AbiType } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

//Use when contract will be used with multicall
export function getContract<TReturn = any>(abi: AbiItemFromJson[], address: string): TReturn {
  let contract = new Contract(abi as any as AbiItem[], address);
  return contract as unknown as TReturn;
}

export function getContractWithProvider<TReturn = any>(
  abi: AbiItemFromJson[],
  address: string,
  provider: any
): TReturn {
  let contract = new Contract(abi as any as AbiItem[], address);
  // @ts-ignore somehow this setProvider methods is not found in the web3 types. Most likely a typing mistake on their part
  contract.setProvider(provider);
  return contract as unknown as TReturn;
}

// override the AbiItem type to make it work properly when importing abi from json
export type AbiItemFromJson = Omit<AbiItem, 'stateMutability' | 'type'> & {
  stateMutability?: string | StateMutabilityType;
  type: string | AbiType;
};
