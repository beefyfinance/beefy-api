import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { addressBookByChainId, ChainId } from '../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../utils/contractHelper';
import { getKey, setKey } from '../../utils/redisHelper';
import { web3Factory } from '../../utils/web3';
const FeeABI = require('../../abis/FeeABI.json');
const { getMultichainVaults } = require('../stats/getMultichainVaults');
const BigNumber = require('bignumber.js');

const feeBatchTreasurySplitMethodABI = [
  {
    inputs: [],
    name: 'treasuryFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const INIT_DELAY = 16000;
const REFRESH_INTERVAL = 20 * 60 * 1000;
const MULTICALL_BATCH_SIZE = 128;

const VAULT_FEES_KEY = 'VAULT_FEES';
const FEE_BATCH_KEY = 'FEE_BATCHES';

interface PerformanceFee {
  total: number;
  call: number;
  strategist: number;
  treasury: number;
  stakers: number;
}

interface VaultFeeBreakdown {
  performance: PerformanceFee;
  withdraw: number;
  lastUpdated: number;
}

interface FeeBatchDetail {
  address: string;
  treasurySplit: number;
  stakerSplit: number;
}

let feeBatches: Record<ChainId, FeeBatchDetail>;
let vaultFees: Record<string, VaultFeeBreakdown>;

const updateFeeBatches = async () => {
  for (const chainId of Object.keys(addressBookByChainId)) {
    const feeBatchAddress = addressBookByChainId[chainId].platforms.beefyfinance.beefyFeeRecipient;
    const web3 = web3Factory(Number(chainId));

    const feeBatchContract = getContractWithProvider(
      feeBatchTreasurySplitMethodABI,
      feeBatchAddress,
      web3
    );

    let treasurySplit;

    try {
      treasurySplit = await feeBatchContract.methods.treasuryFee().call();
    } catch (err) {
      //If reverted, method isn't available on contract so must be older split
      if (err.message.includes('revert') || err.message.includes('correct ABI')) {
        treasurySplit = 140;
      } else {
        console.log(' > Error updating feeBatch on chain ' + chainId);
        console.log(err.message);
      }
    }

    if (treasurySplit) {
      feeBatches[chainId] = {
        address: feeBatchAddress,
        treasurySplit: treasurySplit / 1000,
        stakerSplit: 1 - treasurySplit / 1000,
      };
    } else {
      console.log('Failed to update feeBatch on chain ' + chainId);
    }
  }

  await setKey(FEE_BATCH_KEY, feeBatches);
  console.log(`> feeBatches updated`);
};

const updateVaultFees = async () => {
  console.log(`> updating vault fees`);
  let start = Date.now();
  let vaults = getMultichainVaults();

  let promises = [];

  for (const chain of Object.keys(addressBookByChainId).map(c => Number(c))) {
    const chainVaults = vaults
      .filter(vault => vault.chain === ChainId[chain])
      .filter(
        v => !vaultFees[v.id] || Date.now() - vaultFees[v.id].lastUpdated > 1000 * 60 * 60 * 12
      );
    promises.push(getChainFees(chainVaults, chain, feeBatches[chain]));
  }

  await Promise.allSettled(promises);
  await saveToRedis();

  console.log(`> updated vault fees (${(Date.now() - start) / 1000}s)`);
  setTimeout(updateVaultFees, REFRESH_INTERVAL);
};

const saveToRedis = async () => {
  await setKey(VAULT_FEES_KEY, vaultFees);
};

const mapMulticallResults = (results: ContractCallResults) => {
  return Object.entries(results.results).map(([vaultId, result]) => {
    let mappedObject = {
      id: vaultId,
      strategy: result.originalContractCallContext.contractAddress,
    };

    result.callsReturnContext.forEach(callReturn => {
      if (callReturn.decoded) {
        if (callReturn.reference === 'breakdown') {
          mappedObject[callReturn.reference] = {
            total: new BigNumber(callReturn.returnValues[0].hex),
            beefy: new BigNumber(callReturn.returnValues[1].hex),
            call: new BigNumber(callReturn.returnValues[2].hex),
            strategist: new BigNumber(callReturn.returnValues[3].hex),
          };
        } else if (callReturn.returnValues[0].type === 'BigNumber') {
          mappedObject[callReturn.reference] = new BigNumber(
            callReturn.returnValues[0].hex
          ).toNumber();
        } else {
          mappedObject[callReturn.reference] = callReturn.returnValues[0];
        }
      } else {
        mappedObject[callReturn.reference] = undefined;
      }
    });

    return mappedObject;
  });
};

const getChainFees = async (vaults, chainId, feeBatch: FeeBatchDetail) => {
  try {
    const web3 = web3Factory(chainId);
    const multicall = new Multicall({
      web3Instance: web3,
      tryAggregate: true,
      multicallCustomContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
    });
    const contractCallContext: ContractCallContext[] = [];

    vaults.forEach(vault => {
      contractCallContext.push({
        reference: vault.id,
        contractAddress: vault.strategy,
        abi: FeeABI,
        calls: [
          { reference: 'strategist', methodName: 'strategistFee', methodParameters: [] },
          { reference: 'strategist2', methodName: 'STRATEGIST_FEE', methodParameters: [] },
          { reference: 'call', methodName: 'callFee', methodParameters: [] },
          { reference: 'call2', methodName: 'CALL_FEE', methodParameters: [] },
          { reference: 'call3', methodName: 'callfee', methodParameters: [] },
          { reference: 'call4', methodName: 'callFeeAmount', methodParameters: [] },
          { reference: 'maxCallFee', methodName: 'MAX_CALL_FEE', methodParameters: [] },
          { reference: 'beefy', methodName: 'beefyFee', methodParameters: [] },
          { reference: 'fee', methodName: 'fee', methodParameters: [] },
          { reference: 'treasury', methodName: 'TREASURY_FEE', methodParameters: [] },
          { reference: 'rewards', methodName: 'REWARDS_FEE', methodParameters: [] },
          { reference: 'rewards2', methodName: 'rewardsFee', methodParameters: [] },
          { reference: 'breakdown', methodName: 'getFees', methodParameters: [] },
          { reference: 'maxFee', methodName: 'MAX_FEE', methodParameters: [] },
          { reference: 'maxFee2', methodName: 'max', methodParameters: [] },
          { reference: 'maxFee3', methodName: 'maxfee', methodParameters: [] },
          { reference: 'withdraw', methodName: 'withdrawalFee', methodParameters: [] },
          { reference: 'withdraw2', methodName: 'WITHDRAWAL_FEE', methodParameters: [] },
          { reference: 'withdrawMax', methodName: 'WITHDRAWAL_MAX', methodParameters: [] },
          { reference: 'withdrawMax2', methodName: 'withdrawalMax', methodParameters: [] },
          { reference: 'paused', methodName: 'paused', methodParameters: [] },
        ],
      });
    });

    for (let i = 0; i < contractCallContext.length; i += MULTICALL_BATCH_SIZE) {
      let batch = contractCallContext.slice(i, i + MULTICALL_BATCH_SIZE);
      const results: ContractCallResults = await multicall.call(batch);

      const mappedResults = mapMulticallResults(results);

      for (const contractCalls of mappedResults) {
        let fees = mapStrategyCallsToFeeBreakdown(contractCalls, feeBatch);
        if (fees) {
          vaultFees[contractCalls.id] = fees;
        } else {
          console.log(' > Failed to get fees for ' + contractCalls.id);
        }
      }
    }
  } catch (err) {
    console.log('error on chain ' + chainId);
    console.log(err.message);
  }
};

const withdrawalFeeFromCalls = methodCalls => {
  if (
    (methodCalls.withdraw === undefined && methodCalls.withdraw2 === undefined) ||
    (methodCalls.withdrawMax === undefined && methodCalls.withdrawMax2 === undefined)
  ) {
    return 0;
  } else {
    let withdrawFee = parseFloat(methodCalls.withdraw ?? methodCalls.withdraw2);
    let maxWithdrawFee = parseFloat(methodCalls.withdrawMax ?? methodCalls.withdrawMax2);
    return withdrawFee / maxWithdrawFee;
  }
};

const legacyFeeMappings = (methodCalls, feeBatch: FeeBatchDetail): PerformanceFee => {
  let total = 0.045;
  let performanceFee: PerformanceFee;

  let callFee = methodCalls.call ?? methodCalls.call2 ?? methodCalls.call3 ?? methodCalls.call4;
  let strategistFee = methodCalls.strategist ?? methodCalls.strategist2;
  let maxFee = methodCalls.maxFee ?? methodCalls.maxFee2 ?? methodCalls.maxFee3;
  let beefyFee = methodCalls.beefy;
  let fee = methodCalls.fee;
  let treasury = methodCalls.treasury;
  let rewards = methodCalls.rewards ?? methodCalls.rewards2;

  if (callFee + strategistFee + beefyFee === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (callFee + strategistFee + rewards + treasury === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * treasury) / maxFee,
      stakers: (total * rewards) / maxFee,
    };
  } else if (fee + callFee === maxFee) {
    total = 0.05;
    performanceFee = {
      total: total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: 0,
      stakers: (total * fee) / maxFee,
    };
  } else if (!isNaN(strategistFee + callFee + beefyFee)) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (!isNaN(strategistFee + callFee + treasury)) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: (total * strategistFee) / maxFee,
      treasury: (total * treasury) / maxFee,
      stakers: 0,
    };
  } else if (callFee + treasury + rewards === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: (total * treasury) / maxFee,
      stakers: (total * rewards) / maxFee,
    };
  } else if (callFee + beefyFee === maxFee) {
    if (methodCalls.id === 'cake-cakev2-eol') total = 0.01;
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: (total * feeBatch.treasurySplit * beefyFee) / maxFee,
      stakers: (total * feeBatch.stakerSplit * beefyFee) / maxFee,
    };
  } else if (callFee + fee === maxFee) {
    performanceFee = {
      total,
      call: (total * callFee) / maxFee,
      strategist: 0,
      treasury: 0,
      stakers: (total * fee) / maxFee,
    };
  } else {
    console.log(`> Performance fee fetch failed for: ${methodCalls.id} - ${methodCalls.strategy}`);
  }

  return performanceFee;
};

const performanceFromGetFees = (contractCalls, feeBatch: FeeBatchDetail): PerformanceFee => {
  const fees = contractCalls.breakdown;

  let total = fees.total.div(1e9).toNumber() / 1e9;
  let beefy = fees.beefy.div(1e9).toNumber() / 1e9;
  let call = fees.call.div(1e9).toNumber() / 1e9;
  let strategist = fees.strategist.div(1e9).toNumber() / 1e9;

  const feeSum = beefy + call + strategist;
  const beefySplit = (total * beefy) / feeSum;

  let feeBreakdown = {
    total: total,
    call: (total * call) / feeSum,
    strategist: (total * strategist) / feeSum,
    treasury: feeBatch.treasurySplit * beefySplit,
    stakers: feeBatch.stakerSplit * beefySplit,
  };
  return feeBreakdown;
};

const performanceForMaxi = (contractCalls): PerformanceFee => {
  let performanceFee: PerformanceFee;

  let callFee = parseFloat(
    contractCalls.call ?? contractCalls.call2 ?? contractCalls.call3 ?? contractCalls.call4
  );
  let maxCallFee = parseFloat(contractCalls.maxCallFee ?? 1000);
  let maxFee = parseFloat(contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3);
  let rewards = parseFloat(contractCalls.rewards ?? contractCalls.rewards2);

  let strategyAddress = contractCalls.strategy.toLowerCase();

  // Specific contracts with distinct method for charging fees
  if (
    [
      '0x436D5127F16fAC1F021733dda090b5E6DE30b3bB'.toLowerCase(),
      '0xa9E6E271b27b20F65394914f8784B3B860dBd259'.toLowerCase(),
    ].includes(strategyAddress)
  ) {
    performanceFee = {
      total: callFee / 1000,
      strategist: 0,
      call: callFee / 1000,
      treasury: 0,
      stakers: 0,
    };

    //Another bunch of legacy contracts
  } else if (
    [
      '0x24AAaB9DA14308bAf9d670e2a37369FE8Cb5Fe36',
      '0x22b3d90BDdC3Ad5F2948bE3914255C64Ebc8c9b3',
      '0xbCF1e02ac0c45729dC85F290C4A6AB35c4801cB1',
      '0xb25eB9105549627050AAB3A1c909fBD454014beA',
    ]
      .map(address => address.toLowerCase())
      .includes(strategyAddress)
  ) {
    performanceFee = {
      total: 4.5 * callFee,
      strategist: 0,
      call: 4.5 * callFee,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0xca077eEC87e2621F5B09AFE47C42BAF88c6Af18c'.toLowerCase() === strategyAddress) {
    //avax maxi
    performanceFee = {
      total: 5 / 1000,
      strategist: 0,
      call: 5 / 1000,
      treasury: 0,
      stakers: 0,
    };
  } else if ('0x87056F5E8Dce0fD71605E6E291C6a3B53cbc3818'.toLowerCase() === strategyAddress) {
    //old bifi maxi
    performanceFee = {
      total: (callFee + rewards) / maxFee,
      strategist: 0,
      call: callFee / maxFee,
      treasury: 0,
      stakers: rewards / maxFee,
    };
  } else {
    performanceFee = {
      total: callFee / maxCallFee,
      strategist: 0,
      call: callFee / maxCallFee,
      treasury: 0,
      stakers: 0,
    };
  }
  return performanceFee;
};

const performanceFeesFromCalls = (methodCalls, feeBatch: FeeBatchDetail): PerformanceFee => {
  if (methodCalls.id.includes('-maxi')) {
    return performanceForMaxi(methodCalls);
  } else if (methodCalls.breakdown !== undefined) {
    //newest method
    return performanceFromGetFees(methodCalls, feeBatch);
  } else {
    return legacyFeeMappings(methodCalls, feeBatch);
  }
};

const mapStrategyCallsToFeeBreakdown = (
  methodCalls,
  feeBatch: FeeBatchDetail
): VaultFeeBreakdown => {
  let withdrawFee = withdrawalFeeFromCalls(methodCalls);

  let performanceFee = performanceFeesFromCalls(methodCalls, feeBatch);

  if (withdrawFee === undefined) {
    console.log(`Failed to find withdrawFee for ${methodCalls.id}`);
    return undefined;
  } else if (performanceFee === undefined) {
    console.log(`Failed to find performanceFee for ${methodCalls.id}`);
    return undefined;
  }

  return {
    performance: performanceFee,
    withdraw: withdrawFee,
    lastUpdated: Date.now(),
  };
};

export const initVaultFeeService = async () => {
  const cachedVaultFees = await getKey(VAULT_FEES_KEY);
  const cachedFeeBatches = await getKey(FEE_BATCH_KEY);

  feeBatches = cachedFeeBatches ?? {};
  vaultFees = cachedVaultFees ?? {};

  await updateFeeBatches();

  setTimeout(() => {
    updateVaultFees();
  }, INIT_DELAY);
};

export const getVaultFees = async () => {
  return vaultFees;
};
