import BigNumber from 'bignumber.js';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { addressBookByChainId, ChainId } from '../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../utils/contractHelper';
import { getKey, setKey } from '../../utils/redisHelper';
import { web3Factory } from '../../utils/web3';
const FeeABI = require('../../abis/FeeABI.json');
const { getMultichainVaults } = require('../stats/getMultichainVaults');

const feeBatchTreasurySplitMethodABI = [
  {
    inputs: [],
    name: 'treasuryFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const INIT_DELAY = 15000;
const REFRESH_INTERVAL = 5 * 60 * 1000;
const CACHE_EXPIRY = 1000 * 60 * 60 * 12;
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

interface StrategyCallResponse {
  id: string;
  strategy: string;
  strategist?: number;
  strategist2?: number;
  call?: number;
  call2?: number;
  call3?: number;
  call4?: number;
  maxCallFee?: number;
  beefy?: number;
  fee?: number;
  treasury?: number;
  rewards?: number;
  rewards2?: number;
  breakdown?: {
    total: BigNumber;
    beefy: BigNumber;
    strategist: BigNumber;
    call: BigNumber;
  };
  maxFee?: number;
  maxFee2?: number;
  maxFee3?: number;
  withdraw?: number;
  withdraw2?: number;
  withdrawMax?: number;
  withdrawMax2?: number;
  paused?: boolean;
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
      .filter(v => !vaultFees[v.id] || Date.now() - vaultFees[v.id].lastUpdated > CACHE_EXPIRY);
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

    let promises: Promise<ContractCallResults>[] = [];

    for (let i = 0; i < contractCallContext.length; i += MULTICALL_BATCH_SIZE) {
      let batch = contractCallContext.slice(i, i + MULTICALL_BATCH_SIZE);
      promises.push(multicall.call(batch));
    }

    let results = await Promise.allSettled(promises);
    results.forEach(res => {
      if (res.status === 'fulfilled') {
        const callResponses: StrategyCallResponse[] = mapMulticallResults(res.value);
        for (const contractCalls of callResponses) {
          let fees = mapStrategyCallsToFeeBreakdown(contractCalls, feeBatch);
          if (fees) {
            vaultFees[contractCalls.id] = fees;
          } else {
            console.log(' > Failed to get fees for ' + contractCalls.id);
          }
        }
      } else {
        console.log('> multicall batch failed fetching fees on chain ' + chainId);
        console.log(res.reason);
      }
    });
  } catch (err) {
    console.log('> feeUpdate error on chain ' + chainId);
    console.log(err.message);
  }
};

const mapMulticallResults = (results: ContractCallResults): StrategyCallResponse[] => {
  return Object.entries(results.results).map(([vaultId, result]) => {
    let mappedObject: StrategyCallResponse = {
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
      }
    });

    return mappedObject;
  });
};

const mapStrategyCallsToFeeBreakdown = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): VaultFeeBreakdown => {
  let withdrawFee = withdrawalFeeFromCalls(contractCalls);

  let performanceFee = performanceFeesFromCalls(contractCalls, feeBatch);

  if (withdrawFee === undefined) {
    console.log(`Failed to find withdrawFee for ${contractCalls.id}`);
    return undefined;
  } else if (performanceFee === undefined) {
    console.log(`Failed to find performanceFee for ${contractCalls.id}`);
    return undefined;
  }

  return {
    performance: performanceFee,
    withdraw: withdrawFee,
    lastUpdated: Date.now(),
  };
};

const withdrawalFeeFromCalls = (contractCalls: StrategyCallResponse): number => {
  if (
    (contractCalls.withdraw === undefined && contractCalls.withdraw2 === undefined) ||
    (contractCalls.withdrawMax === undefined && contractCalls.withdrawMax2 === undefined) ||
    contractCalls.paused
  ) {
    return 0;
  } else {
    let withdrawFee = contractCalls.withdraw ?? contractCalls.withdraw2;
    let maxWithdrawFee = contractCalls.withdrawMax ?? contractCalls.withdrawMax2;
    return withdrawFee / maxWithdrawFee;
  }
};

const performanceFeesFromCalls = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): PerformanceFee => {
  if (contractCalls.breakdown !== undefined) {
    //newest method
    return performanceFromGetFees(contractCalls, feeBatch);
  } else if (contractCalls.id.includes('-maxi')) {
    return performanceForMaxi(contractCalls);
  } else {
    return legacyFeeMappings(contractCalls, feeBatch);
  }
};

const legacyFeeMappings = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): PerformanceFee => {
  let total = 0.045;
  let performanceFee: PerformanceFee;

  let callFee =
    contractCalls.call ?? contractCalls.call2 ?? contractCalls.call3 ?? contractCalls.call4;
  let strategistFee = contractCalls.strategist ?? contractCalls.strategist2;
  let maxFee = contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3;
  let beefyFee = contractCalls.beefy;
  let fee = contractCalls.fee;
  let treasury = contractCalls.treasury;
  let rewards = contractCalls.rewards ?? contractCalls.rewards2;

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
    if (contractCalls.id === 'cake-cakev2-eol') total = 0.01;
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
    console.log(
      `> Performance fee fetch failed for: ${contractCalls.id} - ${contractCalls.strategy}`
    );
  }

  return performanceFee;
};

const performanceFromGetFees = (
  contractCalls: StrategyCallResponse,
  feeBatch: FeeBatchDetail
): PerformanceFee => {
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

const performanceForMaxi = (contractCalls: StrategyCallResponse): PerformanceFee => {
  let performanceFee: PerformanceFee;

  let callFee =
    contractCalls.call ?? contractCalls.call2 ?? contractCalls.call3 ?? contractCalls.call4;
  let maxCallFee = contractCalls.maxCallFee ?? 1000;
  let maxFee = contractCalls.maxFee ?? contractCalls.maxFee2 ?? contractCalls.maxFee3;
  let rewards = contractCalls.rewards ?? contractCalls.rewards2;

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
      total: ((45 / 1000) * callFee) / maxFee,
      strategist: 0,
      call: ((45 / 1000) * callFee) / maxFee,
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
