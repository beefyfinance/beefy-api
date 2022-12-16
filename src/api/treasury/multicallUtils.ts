import BigNumber from 'bignumber.js';
import {
  ContractCallContext,
  ContractCallResults,
  ContractCallReturnContext,
} from 'ethereum-multicall';
import { ERC20_ABI } from '../../abis/common/ERC20';
import {
  isNativeAsset,
  isTokenAsset,
  isValidatorAsset,
  isVaultAsset,
  NativeAsset,
  TreasuryAsset,
  ChainTreasuryBalance,
  TreasuryWallet,
  AssetBalance,
} from './types';

export const mapAssetToCall = (
  asset: TreasuryAsset,
  treasuryAddressesForChain: TreasuryWallet[],
  multicallContractAddress: string
): ContractCallContext[] => {
  if (isTokenAsset(asset) || isVaultAsset(asset)) {
    return [
      {
        reference: asset.address.toLowerCase(),
        contractAddress: asset.address,
        abi: ERC20_ABI,
        calls: treasuryAddressesForChain.map((treasuryData: any) => ({
          reference: treasuryData.address.toLowerCase(),
          methodName: 'balanceOf',
          methodParameters: [treasuryData.address],
        })),
        context: {
          type: 'standard',
        },
      },
    ];
  } else if (isNativeAsset(asset)) {
    return [
      {
        reference: asset.address.toLowerCase(),
        contractAddress: multicallContractAddress,
        abi: [
          {
            inputs: [
              {
                internalType: 'address',
                name: 'addr',
                type: 'address',
              },
            ],
            name: 'getEthBalance',
            outputs: [
              {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
              },
            ],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        calls: treasuryAddressesForChain.map((treasuryData: any) => ({
          reference: treasuryData.address.toLowerCase(),
          methodName: 'getEthBalance',
          methodParameters: [treasuryData.address],
        })),
        context: {
          type: 'standard',
        },
      },
    ];
  } else {
    console.log('VALIDATOR');
    return [
      {
        reference: asset.address.toLowerCase(),
        contractAddress: asset.address,
        abi: ERC20_ABI,
        calls: treasuryAddressesForChain.map((treasuryData: any) => ({
          reference: treasuryData.address.toLowerCase(),
          methodName: 'balanceOf',
          methodParameters: [treasuryData.address],
        })),
        context: {
          type: 'validator',
        },
      },
    ];
  }
};

type FullfilledResult = {
  [id: string]: ContractCallReturnContext;
};

export const extractBalancesFromTreasuryMulticallResults = (
  multicallResults: FullfilledResult
): AssetBalance[] => {
  const standardResults = Object.entries(multicallResults).filter(
    ([key, context]) => context.originalContractCallContext.context?.type === 'standard'
  );

  const balances: ChainTreasuryBalance[] = extractFromStandardResult(standardResults);

  return balances;
};

const extractFromStandardResult = (
  standardResults: [string, ContractCallReturnContext][]
): AssetBalance[] => {
  return standardResults.map(([address, returnContext]) => {
    const treasuryBalance: AssetBalance = {
      address,
      balances: {},
    };
    returnContext.callsReturnContext.forEach(callReturn => {
      if (callReturn.decoded) {
        treasuryBalance.balances[callReturn.reference] = new BigNumber(
          callReturn.returnValues[0].hex
        );
      }
    });
    return treasuryBalance;
  });
};
