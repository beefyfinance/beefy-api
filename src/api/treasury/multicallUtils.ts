import BigNumber from 'bignumber.js';
import {
  ContractCallContext,
  ContractCallResults,
  ContractCallReturnContext,
} from 'ethereum-multicall';
import { partition } from 'lodash';
import { ERC20_ABI } from '../../abis/common/ERC20';
import multicallAbi from '../../abis/common/Multicall/MulticallAbi.json';
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
  ValidatorAsset,
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
        abi: multicallAbi,
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
    const validatorAsset = asset as ValidatorAsset;
    return [
      {
        reference: 'validator',
        contractAddress: validatorAsset.methodPath,
        abi: [
          {
            constant: true,
            inputs: [],
            name: 'balance',
            outputs: [
              {
                name: '',
                type: 'uint256',
              },
            ],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ],
        calls: [
          {
            reference: 'validator',
            methodName: 'balance',
            methodParameters: [],
          },
        ],
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
): ChainTreasuryBalance => {
  const [standardResults, validatorResult] = partition(
    Object.entries(multicallResults),
    ([key, context]) => context.originalContractCallContext.context?.type === 'standard'
  );

  const balances: AssetBalance[] = extractFromStandardResult(Object.entries(multicallResults));

  // if (validatorResult.length > 0) {
  //   const validatorBalance: AssetBalance = extractFromValidatorResult(validatorResult[0]);
  // }

  return balances.reduce((all, cur) => ((all[cur.address] = cur), all), {});
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
